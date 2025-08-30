/**
 * Advanced Security Manager for Shopr Chat SDK
 * Enterprise-grade security, rate limiting, and threat protection
 */

class SecurityManager {
  constructor(config = {}) {
    this.config = {
      // Rate limiting configuration
      rateLimits: {
        textQueries: { requests: 30, window: 60000 }, // 30 requests per minute
        imageQueries: { requests: 10, window: 60000 }, // 10 requests per minute
        voiceQueries: { requests: 20, window: 60000 }, // 20 requests per minute
        apiCalls: { requests: 100, window: 60000 }, // 100 API calls per minute
        globalRequests: { requests: 200, window: 300000 } // 200 requests per 5 minutes
      },
      
      // Security policies
      contentSecurityPolicy: {
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        maxImageSize: 10 * 1024 * 1024, // 10MB
        maxQueryLength: 1000,
        allowedDomains: ['api.openai.com', 'api.anthropic.com', 'generativelanguage.googleapis.com'],
        blockedPatterns: [
          /script\s*:/i,
          /javascript\s*:/i,
          /data\s*:/i,
          /vbscript\s*:/i,
          /<script/i,
          /<iframe/i,
          /<object/i,
          /<embed/i
        ]
      },
      
      // Threat detection
      threatDetection: {
        enabled: config.threatDetection !== false,
        maxFailedAttempts: 5,
        lockoutDuration: 300000, // 5 minutes
        suspiciousPatterns: [
          /(\bselect\b|\bunion\b|\binsert\b|\bdelete\b|\bdrop\b|\bcreate\b|\balter\b).*(\bfrom\b|\btable\b|\bdatabase\b)/i,
          /<script[^>]*>.*?<\/script>/gi,
          /javascript\s*:/i,
          /on\w+\s*=/i,
          /eval\s*\(/i,
          /document\.(cookie|domain)/i
        ],
        ipWhitelist: config.ipWhitelist || [],
        ipBlacklist: config.ipBlacklist || []
      },
      
      // Encryption and hashing
      encryption: {
        enabled: config.encryption !== false,
        algorithm: 'AES-GCM',
        keyLength: 256
      },
      
      // Session security
      sessionSecurity: {
        maxSessionDuration: 24 * 60 * 60 * 1000, // 24 hours
        sessionRotationInterval: 60 * 60 * 1000, // 1 hour
        requireSecureContext: config.requireSecureContext !== false
      },
      
      // Logging and monitoring
      logging: {
        enabled: config.logging !== false,
        logLevel: config.logLevel || 'warn',
        logSecurityEvents: config.logSecurityEvents !== false
      },
      
      ...config
    };

    this.rateLimitStore = new Map();
    this.threatStore = new Map();
    this.sessionStore = new Map();
    this.encryptionKey = null;
    this.securityEvents = [];
    
    this.init();
  }

  async init() {
    this.setupRateLimiting();
    this.setupThreatDetection();
    this.setupSessionSecurity();
    
    if (this.config.encryption.enabled) {
      await this.initializeEncryption();
    }
    
    this.startSecurityMonitoring();
    this.logSecurityEvent('security_manager_initialized', { config: this.getPublicConfig() });
  }

  // ==================== RATE LIMITING ====================

  setupRateLimiting() {
    // Clean up expired rate limit entries every minute
    setInterval(() => {
      this.cleanupRateLimitStore();
    }, 60000);
  }

  async checkRateLimit(type, identifier = 'global') {
    const limit = this.config.rateLimits[type];
    if (!limit) return { allowed: true };

    const key = `${type}:${identifier}`;
    const now = Date.now();
    const windowStart = now - limit.window;

    // Get or create rate limit entry
    let entry = this.rateLimitStore.get(key);
    if (!entry) {
      entry = { requests: [], firstRequest: now };
      this.rateLimitStore.set(key, entry);
    }

    // Remove expired requests
    entry.requests = entry.requests.filter(timestamp => timestamp > windowStart);

    // Check if limit exceeded
    if (entry.requests.length >= limit.requests) {
      const oldestRequest = Math.min(...entry.requests);
      const resetTime = oldestRequest + limit.window;
      
      this.logSecurityEvent('rate_limit_exceeded', {
        type,
        identifier,
        limit: limit.requests,
        window: limit.window,
        resetTime
      });

      return {
        allowed: false,
        limit: limit.requests,
        remaining: 0,
        resetTime,
        retryAfter: resetTime - now
      };
    }

    // Add current request
    entry.requests.push(now);
    
    return {
      allowed: true,
      limit: limit.requests,
      remaining: limit.requests - entry.requests.length,
      resetTime: now + limit.window
    };
  }

  cleanupRateLimitStore() {
    const now = Date.now();
    const maxWindow = Math.max(...Object.values(this.config.rateLimits).map(l => l.window));
    
    for (const [key, entry] of this.rateLimitStore.entries()) {
      if (entry.firstRequest < now - maxWindow) {
        this.rateLimitStore.delete(key);
      }
    }
  }

  // ==================== THREAT DETECTION ====================

  setupThreatDetection() {
    if (!this.config.threatDetection.enabled) return;

    // Clean up threat store every 10 minutes
    setInterval(() => {
      this.cleanupThreatStore();
    }, 600000);
  }

  async detectThreats(input, type = 'text', metadata = {}) {
    if (!this.config.threatDetection.enabled) {
      return { safe: true, threats: [] };
    }

    const threats = [];
    const identifier = metadata.userId || metadata.sessionId || 'anonymous';

    // Check for suspicious patterns
    if (typeof input === 'string') {
      for (const pattern of this.config.threatDetection.suspiciousPatterns) {
        if (pattern.test(input)) {
          threats.push({
            type: 'suspicious_pattern',
            pattern: pattern.toString(),
            severity: 'high',
            description: 'Potentially malicious pattern detected'
          });
        }
      }
    }

    // Check content security policy violations
    const cspViolations = this.checkContentSecurityPolicy(input, type);
    threats.push(...cspViolations);

    // Check for repeated failed attempts
    const failedAttempts = this.checkFailedAttempts(identifier);
    if (failedAttempts.blocked) {
      threats.push({
        type: 'rate_abuse',
        severity: 'critical',
        description: 'Too many failed attempts',
        blockUntil: failedAttempts.blockUntil
      });
    }

    // Log threats
    if (threats.length > 0) {
      this.logSecurityEvent('threats_detected', {
        identifier,
        input: this.sanitizeForLogging(input),
        type,
        threats,
        metadata
      });
    }

    return {
      safe: threats.length === 0,
      threats,
      blocked: threats.some(t => t.severity === 'critical')
    };
  }

  checkContentSecurityPolicy(input, type) {
    const violations = [];
    const csp = this.config.contentSecurityPolicy;

    if (type === 'image' && input instanceof File) {
      // Check image type
      if (!csp.allowedImageTypes.includes(input.type)) {
        violations.push({
          type: 'invalid_file_type',
          severity: 'medium',
          description: `File type ${input.type} not allowed`
        });
      }

      // Check image size
      if (input.size > csp.maxImageSize) {
        violations.push({
          type: 'file_too_large',
          severity: 'medium',
          description: `File size ${input.size} exceeds limit ${csp.maxImageSize}`
        });
      }
    }

    if (typeof input === 'string') {
      // Check query length
      if (input.length > csp.maxQueryLength) {
        violations.push({
          type: 'query_too_long',
          severity: 'medium',
          description: `Query length ${input.length} exceeds limit ${csp.maxQueryLength}`
        });
      }

      // Check for blocked patterns
      for (const pattern of csp.blockedPatterns) {
        if (pattern.test(input)) {
          violations.push({
            type: 'blocked_pattern',
            severity: 'high',
            description: 'Input contains blocked pattern',
            pattern: pattern.toString()
          });
        }
      }
    }

    return violations;
  }

  checkFailedAttempts(identifier) {
    const entry = this.threatStore.get(identifier);
    if (!entry) return { blocked: false };

    const now = Date.now();
    
    // Check if still in lockout period
    if (entry.lockedUntil && entry.lockedUntil > now) {
      return {
        blocked: true,
        blockUntil: entry.lockedUntil,
        reason: 'lockout_active'
      };
    }

    // Check failed attempts in recent window
    const recentFailures = entry.failedAttempts.filter(
      timestamp => timestamp > now - this.config.threatDetection.lockoutDuration
    );

    if (recentFailures.length >= this.config.threatDetection.maxFailedAttempts) {
      // Lock the identifier
      entry.lockedUntil = now + this.config.threatDetection.lockoutDuration;
      
      this.logSecurityEvent('identifier_locked', {
        identifier,
        failedAttempts: recentFailures.length,
        lockedUntil: entry.lockedUntil
      });

      return {
        blocked: true,
        blockUntil: entry.lockedUntil,
        reason: 'too_many_failures'
      };
    }

    return { blocked: false };
  }

  recordFailedAttempt(identifier, reason = 'unknown') {
    const now = Date.now();
    let entry = this.threatStore.get(identifier);
    
    if (!entry) {
      entry = { failedAttempts: [], lockedUntil: null };
      this.threatStore.set(identifier, entry);
    }

    entry.failedAttempts.push(now);
    
    this.logSecurityEvent('failed_attempt_recorded', {
      identifier,
      reason,
      totalFailures: entry.failedAttempts.length
    });
  }

  recordSuccessfulAttempt(identifier) {
    // Clear failed attempts on successful request
    const entry = this.threatStore.get(identifier);
    if (entry) {
      entry.failedAttempts = [];
      entry.lockedUntil = null;
    }
  }

  cleanupThreatStore() {
    const now = Date.now();
    const cleanupThreshold = now - (this.config.threatDetection.lockoutDuration * 2);
    
    for (const [identifier, entry] of this.threatStore.entries()) {
      // Remove old failed attempts
      entry.failedAttempts = entry.failedAttempts.filter(
        timestamp => timestamp > cleanupThreshold
      );
      
      // Remove entry if no recent activity and not locked
      if (entry.failedAttempts.length === 0 && (!entry.lockedUntil || entry.lockedUntil < now)) {
        this.threatStore.delete(identifier);
      }
    }
  }

  // ==================== SESSION SECURITY ====================

  setupSessionSecurity() {
    // Check secure context requirement
    if (this.config.sessionSecurity.requireSecureContext && !this.isSecureContext()) {
      this.logSecurityEvent('insecure_context_detected', {
        protocol: window.location.protocol,
        hostname: window.location.hostname
      });
    }

    // Session rotation
    setInterval(() => {
      this.rotateExpiredSessions();
    }, this.config.sessionSecurity.sessionRotationInterval);
  }

  isSecureContext() {
    return window.isSecureContext || 
           window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  }

  createSecureSession(userId = null) {
    const sessionId = this.generateSecureId();
    const now = Date.now();
    
    const session = {
      id: sessionId,
      userId,
      createdAt: now,
      lastActivity: now,
      expiresAt: now + this.config.sessionSecurity.maxSessionDuration,
      rotateAt: now + this.config.sessionSecurity.sessionRotationInterval,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      fingerprint: this.generateFingerprint()
    };

    this.sessionStore.set(sessionId, session);
    
    this.logSecurityEvent('secure_session_created', {
      sessionId,
      userId,
      expiresAt: session.expiresAt
    });

    return session;
  }

  validateSession(sessionId) {
    const session = this.sessionStore.get(sessionId);
    if (!session) {
      return { valid: false, reason: 'session_not_found' };
    }

    const now = Date.now();
    
    // Check expiration
    if (session.expiresAt < now) {
      this.sessionStore.delete(sessionId);
      this.logSecurityEvent('session_expired', { sessionId });
      return { valid: false, reason: 'session_expired' };
    }

    // Check if rotation needed
    if (session.rotateAt < now) {
      return { valid: false, reason: 'session_rotation_required' };
    }

    // Update last activity
    session.lastActivity = now;
    
    return { valid: true, session };
  }

  rotateSession(oldSessionId) {
    const oldSession = this.sessionStore.get(oldSessionId);
    if (!oldSession) return null;

    // Create new session with same user
    const newSession = this.createSecureSession(oldSession.userId);
    
    // Remove old session
    this.sessionStore.delete(oldSessionId);
    
    this.logSecurityEvent('session_rotated', {
      oldSessionId,
      newSessionId: newSession.id,
      userId: oldSession.userId
    });

    return newSession;
  }

  rotateExpiredSessions() {
    const now = Date.now();
    
    for (const [sessionId, session] of this.sessionStore.entries()) {
      if (session.rotateAt < now) {
        this.rotateSession(sessionId);
      }
    }
  }

  generateFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Shopr Security Fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency || 'unknown',
      navigator.deviceMemory || 'unknown'
    ].join('|');

    return this.hashString(fingerprint);
  }

  // ==================== ENCRYPTION ====================

  async initializeEncryption() {
    try {
      this.encryptionKey = await window.crypto.subtle.generateKey(
        {
          name: this.config.encryption.algorithm,
          length: this.config.encryption.keyLength
        },
        false, // not extractable
        ['encrypt', 'decrypt']
      );
      
      this.logSecurityEvent('encryption_initialized', {
        algorithm: this.config.encryption.algorithm,
        keyLength: this.config.encryption.keyLength
      });
    } catch (error) {
      this.logSecurityEvent('encryption_init_failed', { error: error.message });
      throw new Error('Failed to initialize encryption');
    }
  }

  async encryptData(data) {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(JSON.stringify(data));
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: this.config.encryption.algorithm, iv },
        this.encryptionKey,
        dataBuffer
      );

      return {
        encrypted: Array.from(new Uint8Array(encryptedBuffer)),
        iv: Array.from(iv)
      };
    } catch (error) {
      this.logSecurityEvent('encryption_failed', { error: error.message });
      throw error;
    }
  }

  async decryptData(encryptedData) {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      const encryptedBuffer = new Uint8Array(encryptedData.encrypted);
      const iv = new Uint8Array(encryptedData.iv);
      
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: this.config.encryption.algorithm, iv },
        this.encryptionKey,
        encryptedBuffer
      );

      const decoder = new TextDecoder();
      const decryptedString = decoder.decode(decryptedBuffer);
      
      return JSON.parse(decryptedString);
    } catch (error) {
      this.logSecurityEvent('decryption_failed', { error: error.message });
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  generateSecureId() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  getClientIP() {
    // In a real application, this would be provided by the server
    // For client-side, we can only get limited information
    return 'client-side-unknown';
  }

  sanitizeForLogging(input) {
    if (typeof input !== 'string') return '[NON_STRING_INPUT]';
    
    // Truncate long inputs and remove sensitive patterns
    return input
      .substring(0, 200)
      .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]')
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/g, '[PHONE]');
  }

  // ==================== MONITORING AND LOGGING ====================

  startSecurityMonitoring() {
    // Monitor for security-related events
    document.addEventListener('securitypolicyviolation', (event) => {
      this.logSecurityEvent('csp_violation', {
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        documentURI: event.documentURI,
        originalPolicy: event.originalPolicy
      });
    });

    // Monitor for suspicious DOM modifications
    if (window.MutationObserver) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                this.checkSuspiciousElement(node);
              }
            });
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  checkSuspiciousElement(element) {
    const suspiciousAttributes = ['onload', 'onerror', 'onclick', 'onmouseover'];
    const suspiciousTags = ['script', 'iframe', 'object', 'embed'];
    
    if (suspiciousTags.includes(element.tagName.toLowerCase())) {
      this.logSecurityEvent('suspicious_element_detected', {
        tagName: element.tagName,
        innerHTML: element.innerHTML.substring(0, 100),
        attributes: Array.from(element.attributes).map(attr => `${attr.name}="${attr.value}"`)
      });
    }

    for (const attr of suspiciousAttributes) {
      if (element.hasAttribute(attr)) {
        this.logSecurityEvent('suspicious_attribute_detected', {
          tagName: element.tagName,
          attribute: attr,
          value: element.getAttribute(attr)
        });
      }
    }
  }

  logSecurityEvent(type, data) {
    if (!this.config.logging.enabled) return;

    const event = {
      type,
      timestamp: Date.now(),
      data,
      severity: this.getEventSeverity(type),
      sessionId: this.getCurrentSessionId(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.securityEvents.push(event);

    // Log to console based on severity and log level
    if (this.shouldLogEvent(event.severity)) {
      const logMethod = event.severity === 'critical' ? 'error' : 
                       event.severity === 'high' ? 'warn' : 'log';
      console[logMethod](`🔒 Security Event [${type}]:`, event);
    }

    // Send critical events immediately
    if (event.severity === 'critical') {
      this.sendSecurityAlert(event);
    }
  }

  getEventSeverity(type) {
    const severityMap = {
      'threats_detected': 'high',
      'rate_limit_exceeded': 'medium',
      'identifier_locked': 'high',
      'session_expired': 'low',
      'csp_violation': 'high',
      'suspicious_element_detected': 'critical',
      'encryption_failed': 'critical',
      'insecure_context_detected': 'medium'
    };

    return severityMap[type] || 'low';
  }

  shouldLogEvent(severity) {
    const levels = ['low', 'medium', 'high', 'critical'];
    const configLevel = levels.indexOf(this.config.logging.logLevel);
    const eventLevel = levels.indexOf(severity);
    
    return eventLevel >= configLevel;
  }

  getCurrentSessionId() {
    // Get current session ID from session store or generate temporary one
    for (const [sessionId, session] of this.sessionStore.entries()) {
      if (session.lastActivity > Date.now() - 300000) { // 5 minutes
        return sessionId;
      }
    }
    return 'no-active-session';
  }

  async sendSecurityAlert(event) {
    try {
      await fetch('/api/security/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to send security alert:', error);
    }
  }

  // ==================== PUBLIC API ====================

  getPublicConfig() {
    return {
      rateLimits: this.config.rateLimits,
      threatDetection: {
        enabled: this.config.threatDetection.enabled,
        maxFailedAttempts: this.config.threatDetection.maxFailedAttempts
      },
      sessionSecurity: {
        maxSessionDuration: this.config.sessionSecurity.maxSessionDuration,
        requireSecureContext: this.config.sessionSecurity.requireSecureContext
      },
      encryption: {
        enabled: this.config.encryption.enabled,
        algorithm: this.config.encryption.algorithm
      }
    };
  }

  getSecurityStatus() {
    return {
      rateLimitStore: this.rateLimitStore.size,
      threatStore: this.threatStore.size,
      sessionStore: this.sessionStore.size,
      securityEvents: this.securityEvents.length,
      encryptionReady: !!this.encryptionKey,
      secureContext: this.isSecureContext()
    };
  }

  getSecurityEvents(limit = 100) {
    return this.securityEvents.slice(-limit);
  }

  clearSecurityEvents() {
    this.securityEvents = [];
  }
}

// Export for global use
window.SecurityManager = SecurityManager;