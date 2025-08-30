/**
 * Production Analytics & Monitoring System for Shopr Chat SDK
 * Enterprise-grade analytics, error tracking, and performance monitoring
 */

class ProductionAnalytics {
  constructor(config = {}) {
    this.config = {
      apiEndpoint: config.apiEndpoint || '/api/analytics',
      sessionId: this.generateSessionId(),
      userId: config.userId || null,
      enableErrorTracking: config.enableErrorTracking !== false,
      enablePerformanceTracking: config.enablePerformanceTracking !== false,
      enableUserBehaviorTracking: config.enableUserBehaviorTracking !== false,
      batchSize: config.batchSize || 10,
      flushInterval: config.flushInterval || 30000, // 30 seconds
      maxRetries: config.maxRetries || 3,
      debug: config.debug || false,
      ...config
    };

    this.eventQueue = [];
    this.errorQueue = [];
    this.performanceQueue = [];
    this.retryCount = new Map();
    this.sessionStartTime = Date.now();
    this.lastActivityTime = Date.now();

    this.init();
  }

  init() {
    this.setupErrorTracking();
    this.setupPerformanceTracking();
    this.setupUserBehaviorTracking();
    this.startBatchProcessor();
    this.trackSessionStart();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // ==================== ERROR TRACKING ====================

  setupErrorTracking() {
    if (!this.config.enableErrorTracking) return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        timestamp: Date.now(),
        url: window.location.href
      });
    });

    // API error tracking
    this.setupAPIErrorTracking();
  }

  setupAPIErrorTracking() {
    // Monkey patch fetch to track API errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        // Track API performance
        this.trackAPICall({
          url: typeof url === 'string' ? url : url.url,
          method: args[1]?.method || 'GET',
          status: response.status,
          duration: endTime - startTime,
          success: response.ok,
          timestamp: Date.now()
        });

        if (!response.ok) {
          this.trackError({
            type: 'api_error',
            message: `API Error: ${response.status} ${response.statusText}`,
            url: typeof url === 'string' ? url : url.url,
            status: response.status,
            timestamp: Date.now()
          });
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        
        this.trackAPICall({
          url: typeof url === 'string' ? url : url.url,
          method: args[1]?.method || 'GET',
          status: 0,
          duration: endTime - startTime,
          success: false,
          error: error.message,
          timestamp: Date.now()
        });

        this.trackError({
          type: 'network_error',
          message: error.message,
          url: typeof url === 'string' ? url : url.url,
          stack: error.stack,
          timestamp: Date.now()
        });

        throw error;
      }
    };
  }

  trackError(errorData) {
    const enrichedError = {
      ...errorData,
      sessionId: this.config.sessionId,
      userId: this.config.userId,
      timestamp: errorData.timestamp || Date.now(),
      severity: this.calculateErrorSeverity(errorData),
      context: this.getContextualData(),
      id: this.generateEventId()
    };

    this.errorQueue.push(enrichedError);
    
    if (this.config.debug) {
      console.error('🚨 Error tracked:', enrichedError);
    }

    // Immediate flush for critical errors
    if (enrichedError.severity === 'critical') {
      this.flushErrors();
    }
  }

  calculateErrorSeverity(errorData) {
    if (errorData.type === 'network_error' || errorData.status >= 500) {
      return 'critical';
    } else if (errorData.status >= 400 || errorData.type === 'api_error') {
      return 'high';
    } else if (errorData.type === 'javascript_error') {
      return 'medium';
    }
    return 'low';
  }

  // ==================== PERFORMANCE TRACKING ====================

  setupPerformanceTracking() {
    if (!this.config.enablePerformanceTracking) return;

    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.trackPagePerformance();
      }, 0);
    });

    // Track Core Web Vitals
    this.trackCoreWebVitals();
  }

  trackPagePerformance() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (!navigation) return;

    this.trackPerformance({
      type: 'page_load',
      metrics: {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: this.getFirstPaint(),
        firstContentfulPaint: this.getFirstContentfulPaint(),
        totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
        dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcpConnection: navigation.connectEnd - navigation.connectStart,
        serverResponse: navigation.responseEnd - navigation.requestStart
      },
      timestamp: Date.now()
    });
  }

  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }

  trackCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.trackPerformance({
        type: 'core_web_vital',
        metric: 'LCP',
        value: lastEntry.startTime,
        rating: this.getLCPRating(lastEntry.startTime),
        timestamp: Date.now()
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        this.trackPerformance({
          type: 'core_web_vital',
          metric: 'FID',
          value: entry.processingStart - entry.startTime,
          rating: this.getFIDRating(entry.processingStart - entry.startTime),
          timestamp: Date.now()
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      this.trackPerformance({
        type: 'core_web_vital',
        metric: 'CLS',
        value: clsValue,
        rating: this.getCLSRating(clsValue),
        timestamp: Date.now()
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  getLCPRating(value) {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  getFIDRating(value) {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  getCLSRating(value) {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  trackPerformance(performanceData) {
    const enrichedPerformance = {
      ...performanceData,
      sessionId: this.config.sessionId,
      userId: this.config.userId,
      timestamp: performanceData.timestamp || Date.now(),
      context: this.getContextualData(),
      id: this.generateEventId()
    };

    this.performanceQueue.push(enrichedPerformance);
    
    if (this.config.debug) {
      console.log('📊 Performance tracked:', enrichedPerformance);
    }
  }

  // ==================== USER BEHAVIOR TRACKING ====================

  setupUserBehaviorTracking() {
    if (!this.config.enableUserBehaviorTracking) return;

    // Track user interactions
    document.addEventListener('click', (event) => {
      this.trackUserInteraction('click', event);
    });

    document.addEventListener('scroll', this.throttle(() => {
      this.trackUserInteraction('scroll', {
        scrollY: window.scrollY,
        scrollPercentage: (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      });
    }, 1000));

    // Track session duration
    setInterval(() => {
      this.trackSessionDuration();
    }, 60000); // Every minute

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackUserInteraction('visibility_change', {
        hidden: document.hidden,
        visibilityState: document.visibilityState
      });
    });
  }

  trackUserInteraction(type, data) {
    this.lastActivityTime = Date.now();
    
    const interactionData = {
      type: 'user_interaction',
      interactionType: type,
      data: typeof data === 'object' && data.target ? {
        tagName: data.target.tagName,
        className: data.target.className,
        id: data.target.id,
        textContent: data.target.textContent?.substring(0, 100)
      } : data,
      timestamp: Date.now()
    };

    this.trackEvent(interactionData);
  }

  trackSessionDuration() {
    const duration = Date.now() - this.sessionStartTime;
    const inactiveTime = Date.now() - this.lastActivityTime;
    
    this.trackEvent({
      type: 'session_duration',
      duration,
      inactiveTime,
      isActive: inactiveTime < 300000, // 5 minutes
      timestamp: Date.now()
    });
  }

  // ==================== CHAT-SPECIFIC ANALYTICS ====================

  trackChatInteraction(interactionType, data) {
    this.trackEvent({
      type: 'chat_interaction',
      interactionType,
      data,
      timestamp: Date.now()
    });
  }

  trackQueryPerformance(queryType, query, responseTime, success, resultCount) {
    this.trackEvent({
      type: 'query_performance',
      queryType,
      query: this.sanitizeQuery(query),
      responseTime,
      success,
      resultCount,
      timestamp: Date.now()
    });
  }

  trackProductInteraction(productId, interactionType, productData) {
    this.trackEvent({
      type: 'product_interaction',
      productId,
      interactionType,
      productData,
      timestamp: Date.now()
    });
  }

  trackConversionFunnel(stage, data) {
    this.trackEvent({
      type: 'conversion_funnel',
      stage, // 'discovery', 'interest', 'consideration', 'purchase'
      data,
      timestamp: Date.now()
    });
  }

  sanitizeQuery(query) {
    // Remove sensitive information from queries before logging
    if (typeof query !== 'string') return query;
    
    // Remove potential PII patterns
    return query
      .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD_NUMBER]')
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/g, '[PHONE]');
  }

  // ==================== API CALL TRACKING ====================

  trackAPICall(apiData) {
    this.trackEvent({
      type: 'api_call',
      ...apiData,
      timestamp: Date.now()
    });
  }

  // ==================== GENERAL EVENT TRACKING ====================

  trackEvent(eventData) {
    const enrichedEvent = {
      ...eventData,
      sessionId: this.config.sessionId,
      userId: this.config.userId,
      timestamp: eventData.timestamp || Date.now(),
      context: this.getContextualData(),
      id: this.generateEventId()
    };

    this.eventQueue.push(enrichedEvent);
    
    if (this.config.debug) {
      console.log('📈 Event tracked:', enrichedEvent);
    }
  }

  trackSessionStart() {
    this.trackEvent({
      type: 'session_start',
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      referrer: document.referrer,
      timestamp: this.sessionStartTime
    });
  }

  // ==================== CONTEXTUAL DATA ====================

  getContextualData() {
    return {
      url: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      connectionType: navigator.connection?.effectiveType || 'unknown',
      timestamp: Date.now()
    };
  }

  // ==================== BATCH PROCESSING ====================

  startBatchProcessor() {
    setInterval(() => {
      this.processBatches();
    }, this.config.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushAll();
    });

    // Flush on visibility change (when user switches tabs)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.flushAll();
      }
    });
  }

  processBatches() {
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flushEvents();
    }
    
    if (this.errorQueue.length > 0) {
      this.flushErrors();
    }
    
    if (this.performanceQueue.length > 0) {
      this.flushPerformance();
    }
  }

  async flushEvents() {
    if (this.eventQueue.length === 0) return;

    const batch = this.eventQueue.splice(0, this.config.batchSize);
    await this.sendBatch('events', batch);
  }

  async flushErrors() {
    if (this.errorQueue.length === 0) return;

    const batch = this.errorQueue.splice(0, this.config.batchSize);
    await this.sendBatch('errors', batch);
  }

  async flushPerformance() {
    if (this.performanceQueue.length === 0) return;

    const batch = this.performanceQueue.splice(0, this.config.batchSize);
    await this.sendBatch('performance', batch);
  }

  flushAll() {
    this.flushEvents();
    this.flushErrors();
    this.flushPerformance();
  }

  async sendBatch(type, batch) {
    const batchId = this.generateEventId();
    
    try {
      const response = await fetch(`${this.config.apiEndpoint}/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.config.sessionId,
          'X-Batch-ID': batchId
        },
        body: JSON.stringify({
          batchId,
          type,
          events: batch,
          metadata: {
            sessionId: this.config.sessionId,
            userId: this.config.userId,
            timestamp: Date.now(),
            batchSize: batch.length
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }

      if (this.config.debug) {
        console.log(`📤 Analytics batch sent: ${type} (${batch.length} events)`);
      }

      // Reset retry count on success
      this.retryCount.delete(batchId);

    } catch (error) {
      console.error('Failed to send analytics batch:', error);
      
      // Retry logic
      const retries = this.retryCount.get(batchId) || 0;
      if (retries < this.config.maxRetries) {
        this.retryCount.set(batchId, retries + 1);
        
        // Exponential backoff
        setTimeout(() => {
          this.sendBatch(type, batch);
        }, Math.pow(2, retries) * 1000);
      } else {
        console.error(`Max retries exceeded for batch ${batchId}`);
        this.retryCount.delete(batchId);
      }
    }
  }

  // ==================== UTILITY METHODS ====================

  generateEventId() {
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // ==================== PUBLIC API ====================

  setUserId(userId) {
    this.config.userId = userId;
  }

  updateConfig(newConfig) {
    Object.assign(this.config, newConfig);
  }

  getSessionInfo() {
    return {
      sessionId: this.config.sessionId,
      userId: this.config.userId,
      startTime: this.sessionStartTime,
      duration: Date.now() - this.sessionStartTime,
      lastActivity: this.lastActivityTime,
      queueSizes: {
        events: this.eventQueue.length,
        errors: this.errorQueue.length,
        performance: this.performanceQueue.length
      }
    };
  }

  destroy() {
    this.flushAll();
    // Clean up event listeners and intervals would go here
  }
}

// Export for global use
window.ProductionAnalytics = ProductionAnalytics;