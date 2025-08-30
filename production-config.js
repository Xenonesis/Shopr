/**
 * Production Configuration for Shopr Chat SDK
 * Enterprise-grade configuration management for production deployment
 */

class ProductionConfig {
  constructor() {
    this.environment = this.detectEnvironment();
    this.config = this.loadConfiguration();
    this.validators = this.setupValidators();
    this.monitors = this.setupMonitors();
    
    this.init();
  }

  detectEnvironment() {
    // Detect environment based on various factors
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('dev')) {
      return 'development';
    } else if (hostname.includes('staging') || hostname.includes('test')) {
      return 'staging';
    } else if (protocol === 'https:' && !port) {
      return 'production';
    } else {
      return 'development';
    }
  }

  loadConfiguration() {
    const baseConfig = {
      // Environment-specific settings
      environment: this.environment,
      debug: this.environment !== 'production',
      
      // API Configuration
      api: {
        baseUrl: this.getAPIBaseUrl(),
        timeout: this.environment === 'production' ? 30000 : 10000,
        retries: this.environment === 'production' ? 3 : 1,
        rateLimiting: {
          enabled: true,
          requestsPerMinute: this.environment === 'production' ? 100 : 1000,
          burstLimit: this.environment === 'production' ? 20 : 100
        }
      },

      // Security Configuration
      security: {
        enableCSP: this.environment === 'production',
        enableSRI: this.environment === 'production',
        enableHTTPS: this.environment === 'production',
        sessionTimeout: this.environment === 'production' ? 1800000 : 3600000, // 30min vs 1hr
        encryptionEnabled: this.environment === 'production',
        threatDetection: {
          enabled: true,
          strictMode: this.environment === 'production',
          maxFailedAttempts: this.environment === 'production' ? 3 : 10,
          lockoutDuration: this.environment === 'production' ? 900000 : 300000 // 15min vs 5min
        }
      },

      // Performance Configuration
      performance: {
        enableCaching: true,
        cacheTimeout: this.environment === 'production' ? 3600000 : 300000, // 1hr vs 5min
        enableCompression: this.environment === 'production',
        enableLazyLoading: true,
        maxConcurrentRequests: this.environment === 'production' ? 5 : 10,
        enableServiceWorker: this.environment === 'production',
        enablePrefetching: this.environment === 'production'
      },

      // Analytics Configuration
      analytics: {
        enabled: true,
        endpoint: this.getAnalyticsEndpoint(),
        batchSize: this.environment === 'production' ? 50 : 10,
        flushInterval: this.environment === 'production' ? 60000 : 10000, // 1min vs 10sec
        enableErrorTracking: true,
        enablePerformanceTracking: this.environment === 'production',
        enableUserBehaviorTracking: this.environment === 'production',
        sampling: {
          errors: 1.0, // Track all errors
          performance: this.environment === 'production' ? 0.1 : 1.0, // 10% vs 100%
          userBehavior: this.environment === 'production' ? 0.05 : 1.0 // 5% vs 100%
        }
      },

      // Logging Configuration
      logging: {
        level: this.environment === 'production' ? 'warn' : 'debug',
        enableConsoleLogging: this.environment !== 'production',
        enableRemoteLogging: this.environment === 'production',
        maxLogSize: 1000,
        logRotation: this.environment === 'production'
      },

      // Feature Flags
      features: {
        enableVoiceSearch: true,
        enableImageSearch: true,
        enablePersonalization: true,
        enableABTesting: this.environment === 'production',
        enableAdvancedAnimations: true,
        enableOfflineMode: this.environment === 'production',
        enablePushNotifications: this.environment === 'production'
      },

      // UI Configuration
      ui: {
        theme: 'default',
        animations: {
          enabled: true,
          duration: this.environment === 'production' ? 300 : 500,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        },
        responsiveness: {
          breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1200
          }
        }
      },

      // Personalization Configuration
      personalization: {
        enabled: true,
        maxHistoryItems: this.environment === 'production' ? 500 : 100,
        updateInterval: this.environment === 'production' ? 300000 : 60000, // 5min vs 1min
        collaborativeFiltering: this.environment === 'production',
        contentBasedFiltering: true,
        realTimeAdaptation: this.environment === 'production'
      },

      // CDN Configuration
      cdn: {
        enabled: this.environment === 'production',
        baseUrl: this.getCDNBaseUrl(),
        fallbackEnabled: true,
        preloadCriticalAssets: this.environment === 'production'
      },

      // Monitoring Configuration
      monitoring: {
        enabled: this.environment === 'production',
        healthCheckInterval: 60000, // 1 minute
        alertThresholds: {
          errorRate: 0.05, // 5%
          responseTime: 5000, // 5 seconds
          memoryUsage: 0.8, // 80%
          cpuUsage: 0.8 // 80%
        },
        uptime: {
          enabled: this.environment === 'production',
          endpoint: '/api/health',
          interval: 30000 // 30 seconds
        }
      }
    };

    // Merge with environment-specific overrides
    return this.mergeEnvironmentConfig(baseConfig);
  }

  getAPIBaseUrl() {
    const envUrls = {
      development: 'http://localhost:3000/api',
      staging: 'https://staging-api.shopr.com/api',
      production: 'https://api.shopr.com/api'
    };
    return envUrls[this.environment] || envUrls.development;
  }

  getAnalyticsEndpoint() {
    const envEndpoints = {
      development: 'http://localhost:3000/analytics',
      staging: 'https://staging-analytics.shopr.com',
      production: 'https://analytics.shopr.com'
    };
    return envEndpoints[this.environment] || envEndpoints.development;
  }

  getCDNBaseUrl() {
    const envCDNs = {
      development: null,
      staging: 'https://staging-cdn.shopr.com',
      production: 'https://cdn.shopr.com'
    };
    return envCDNs[this.environment];
  }

  mergeEnvironmentConfig(baseConfig) {
    // Load environment-specific overrides
    const envConfig = this.loadEnvironmentOverrides();
    return this.deepMerge(baseConfig, envConfig);
  }

  loadEnvironmentOverrides() {
    // Try to load from various sources
    const sources = [
      () => window.SHOPR_CONFIG, // Global config object
      () => this.loadFromLocalStorage(),
      () => this.loadFromSessionStorage(),
      () => this.loadFromMetaTags(),
      () => this.loadFromDataAttributes()
    ];

    let config = {};
    for (const source of sources) {
      try {
        const sourceConfig = source();
        if (sourceConfig) {
          config = this.deepMerge(config, sourceConfig);
        }
      } catch (error) {
        console.warn('Failed to load config from source:', error);
      }
    }

    return config;
  }

  loadFromLocalStorage() {
    const stored = localStorage.getItem('shopr_production_config');
    return stored ? JSON.parse(stored) : null;
  }

  loadFromSessionStorage() {
    const stored = sessionStorage.getItem('shopr_production_config');
    return stored ? JSON.parse(stored) : null;
  }

  loadFromMetaTags() {
    const config = {};
    const metaTags = document.querySelectorAll('meta[name^="shopr-config-"]');
    
    metaTags.forEach(tag => {
      const key = tag.name.replace('shopr-config-', '').replace(/-/g, '.');
      const value = this.parseConfigValue(tag.content);
      this.setNestedProperty(config, key, value);
    });

    return Object.keys(config).length > 0 ? config : null;
  }

  loadFromDataAttributes() {
    const configElement = document.querySelector('[data-shopr-config]');
    if (!configElement) return null;

    const config = {};
    for (const [key, value] of Object.entries(configElement.dataset)) {
      if (key.startsWith('shoprConfig')) {
        const configKey = key.replace('shoprConfig', '').toLowerCase();
        config[configKey] = this.parseConfigValue(value);
      }
    }

    return Object.keys(config).length > 0 ? config : null;
  }

  parseConfigValue(value) {
    // Try to parse as JSON first
    try {
      return JSON.parse(value);
    } catch {
      // Handle boolean strings
      if (value === 'true') return true;
      if (value === 'false') return false;
      
      // Handle numeric strings
      if (!isNaN(value) && !isNaN(parseFloat(value))) {
        return parseFloat(value);
      }
      
      // Return as string
      return value;
    }
  }

  setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  setupValidators() {
    return {
      api: {
        baseUrl: (url) => {
          try {
            new URL(url);
            return this.environment === 'production' ? url.startsWith('https://') : true;
          } catch {
            return false;
          }
        },
        timeout: (timeout) => timeout > 0 && timeout <= 60000,
        retries: (retries) => retries >= 0 && retries <= 5
      },
      
      security: {
        sessionTimeout: (timeout) => timeout >= 300000 && timeout <= 86400000, // 5min to 24hr
        maxFailedAttempts: (attempts) => attempts >= 1 && attempts <= 10,
        lockoutDuration: (duration) => duration >= 60000 && duration <= 3600000 // 1min to 1hr
      },
      
      performance: {
        cacheTimeout: (timeout) => timeout >= 60000 && timeout <= 86400000, // 1min to 24hr
        maxConcurrentRequests: (max) => max >= 1 && max <= 20,
        batchSize: (size) => size >= 1 && size <= 100
      },
      
      analytics: {
        flushInterval: (interval) => interval >= 5000 && interval <= 300000, // 5sec to 5min
        sampling: (rate) => rate >= 0 && rate <= 1
      }
    };
  }

  setupMonitors() {
    const monitors = [];

    // Performance monitor
    if (this.config.monitoring.enabled) {
      monitors.push(new PerformanceMonitor(this.config.monitoring));
    }

    // Health check monitor
    if (this.config.monitoring.uptime.enabled) {
      monitors.push(new UptimeMonitor(this.config.monitoring.uptime));
    }

    // Error rate monitor
    monitors.push(new ErrorRateMonitor(this.config.monitoring.alertThresholds));

    return monitors;
  }

  init() {
    this.validateConfiguration();
    this.setupEnvironmentSpecificFeatures();
    this.startMonitoring();
    this.logInitialization();
  }

  validateConfiguration() {
    const errors = [];
    
    // Validate API configuration
    if (!this.validators.api.baseUrl(this.config.api.baseUrl)) {
      errors.push('Invalid API base URL');
    }
    
    if (!this.validators.api.timeout(this.config.api.timeout)) {
      errors.push('Invalid API timeout');
    }
    
    // Validate security configuration
    if (!this.validators.security.sessionTimeout(this.config.security.sessionTimeout)) {
      errors.push('Invalid session timeout');
    }
    
    // Validate performance configuration
    if (!this.validators.performance.cacheTimeout(this.config.performance.cacheTimeout)) {
      errors.push('Invalid cache timeout');
    }
    
    if (errors.length > 0) {
      console.error('Configuration validation failed:', errors);
      if (this.environment === 'production') {
        throw new Error('Invalid production configuration: ' + errors.join(', '));
      }
    }
  }

  setupEnvironmentSpecificFeatures() {
    // Production-specific setup
    if (this.environment === 'production') {
      this.setupProductionSecurity();
      this.setupProductionPerformance();
      this.setupProductionMonitoring();
    }
    
    // Development-specific setup
    if (this.environment === 'development') {
      this.setupDevelopmentTools();
    }
  }

  setupProductionSecurity() {
    // Content Security Policy
    if (this.config.security.enableCSP) {
      this.setupContentSecurityPolicy();
    }
    
    // Subresource Integrity
    if (this.config.security.enableSRI) {
      this.setupSubresourceIntegrity();
    }
    
    // HTTPS enforcement
    if (this.config.security.enableHTTPS && window.location.protocol !== 'https:') {
      window.location.replace(window.location.href.replace('http:', 'https:'));
    }
  }

  setupContentSecurityPolicy() {
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.shopr.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.shopr.com https://analytics.shopr.com",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
    
    document.head.appendChild(cspMeta);
  }

  setupSubresourceIntegrity() {
    // Add integrity checks to external scripts and stylesheets
    const externalResources = document.querySelectorAll('script[src], link[rel="stylesheet"][href]');
    
    externalResources.forEach(resource => {
      if (resource.src && resource.src.includes('cdn.shopr.com')) {
        // In a real implementation, you would have pre-calculated hashes
        resource.integrity = 'sha384-example-hash';
        resource.crossOrigin = 'anonymous';
      }
    });
  }

  setupProductionPerformance() {
    // Service Worker registration
    if (this.config.performance.enableServiceWorker && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
    
    // Resource prefetching
    if (this.config.performance.enablePrefetching) {
      this.setupResourcePrefetching();
    }
    
    // Lazy loading setup
    if (this.config.performance.enableLazyLoading) {
      this.setupLazyLoading();
    }
  }

  setupResourcePrefetching() {
    const criticalResources = [
      '/api/products/trending',
      '/api/categories',
      '/assets/images/logo/logo.svg'
    ];
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  }

  setupLazyLoading() {
    // Setup Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      const lazyImageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            lazyImageObserver.unobserve(img);
          }
        });
      });
      
      // Observe all lazy images
      document.querySelectorAll('img[data-src]').forEach(img => {
        lazyImageObserver.observe(img);
      });
    }
  }

  setupProductionMonitoring() {
    // Start all monitors
    this.monitors.forEach(monitor => {
      if (monitor.start) {
        monitor.start();
      }
    });
    
    // Setup global error handling
    window.addEventListener('error', (event) => {
      this.reportError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });
    
    // Setup unhandled promise rejection handling
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack
      });
    });
  }

  setupDevelopmentTools() {
    // Development console commands
    window.shoprConfig = this;
    window.shoprDebug = {
      getConfig: () => this.config,
      setConfig: (key, value) => this.updateConfig(key, value),
      validateConfig: () => this.validateConfiguration(),
      getMonitors: () => this.monitors,
      clearCache: () => this.clearCache()
    };
    
    console.log('🛠️ Development tools available:', {
      'window.shoprConfig': 'Configuration manager',
      'window.shoprDebug': 'Debug utilities'
    });
  }

  startMonitoring() {
    if (!this.config.monitoring.enabled) return;
    
    // Health check interval
    setInterval(() => {
      this.performHealthCheck();
    }, this.config.monitoring.healthCheckInterval);
    
    // Performance monitoring
    if (this.config.monitoring.enabled) {
      this.startPerformanceMonitoring();
    }
  }

  performHealthCheck() {
    const healthData = {
      timestamp: Date.now(),
      environment: this.environment,
      userAgent: navigator.userAgent,
      url: window.location.href,
      memory: this.getMemoryUsage(),
      performance: this.getPerformanceMetrics(),
      errors: this.getRecentErrors()
    };
    
    // Send health data to monitoring endpoint
    if (this.config.monitoring.uptime.endpoint) {
      fetch(this.config.monitoring.uptime.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(healthData)
      }).catch(error => {
        console.error('Health check failed:', error);
      });
    }
  }

  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        usage: performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  getPerformanceMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (!navigation) return null;
    
    return {
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.getFirstContentfulPaint()
    };
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

  getRecentErrors() {
    // Return recent errors from error tracking
    return []; // Placeholder
  }

  startPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.reportMetric('LCP', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // First Input Delay
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.reportMetric('FID', entry.processingStart - entry.startTime);
        });
      }).observe({ entryTypes: ['first-input'] });
      
      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.reportMetric('CLS', clsValue);
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  reportError(error) {
    if (this.config.analytics.enabled && this.config.analytics.enableErrorTracking) {
      // Send error to analytics endpoint
      fetch(`${this.config.analytics.endpoint}/errors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...error,
          timestamp: Date.now(),
          environment: this.environment,
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(err => {
        console.error('Failed to report error:', err);
      });
    }
  }

  reportMetric(name, value) {
    if (this.config.analytics.enabled && this.config.analytics.enablePerformanceTracking) {
      // Sample based on configuration
      if (Math.random() > this.config.analytics.sampling.performance) {
        return;
      }
      
      fetch(`${this.config.analytics.endpoint}/metrics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          value,
          timestamp: Date.now(),
          environment: this.environment,
          url: window.location.href
        })
      }).catch(error => {
        console.error('Failed to report metric:', error);
      });
    }
  }

  logInitialization() {
    const logData = {
      environment: this.environment,
      timestamp: Date.now(),
      config: this.getPublicConfig(),
      features: this.config.features,
      performance: this.config.performance,
      security: {
        enabled: this.config.security.enableCSP || this.config.security.enableSRI,
        https: window.location.protocol === 'https:'
      }
    };
    
    if (this.config.logging.enableConsoleLogging) {
      console.log('🚀 Shopr Production Config initialized:', logData);
    }
    
    if (this.config.logging.enableRemoteLogging) {
      this.reportMetric('config_initialized', 1);
    }
  }

  // ==================== PUBLIC API ====================

  getConfig(key = null) {
    if (key) {
      return this.getNestedProperty(this.config, key);
    }
    return this.config;
  }

  updateConfig(key, value) {
    this.setNestedProperty(this.config, key, value);
    this.validateConfiguration();
    
    // Save to localStorage for persistence
    localStorage.setItem('shopr_production_config', JSON.stringify({
      [key]: value
    }));
  }

  getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  getPublicConfig() {
    // Return config without sensitive information
    const publicConfig = { ...this.config };
    
    // Remove sensitive keys
    delete publicConfig.api?.apiKey;
    delete publicConfig.analytics?.apiKey;
    
    return publicConfig;
  }

  isFeatureEnabled(feature) {
    return this.config.features[feature] === true;
  }

  getEnvironment() {
    return this.environment;
  }

  isProduction() {
    return this.environment === 'production';
  }

  isDevelopment() {
    return this.environment === 'development';
  }

  clearCache() {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    localStorage.removeItem('shopr_cache');
    sessionStorage.removeItem('shopr_cache');
  }

  restart() {
    this.clearCache();
    window.location.reload();
  }
}

// Simple monitor classes
class PerformanceMonitor {
  constructor(config) {
    this.config = config;
    this.metrics = [];
  }
  
  start() {
    setInterval(() => {
      this.collectMetrics();
    }, this.config.healthCheckInterval);
  }
  
  collectMetrics() {
    const memory = performance.memory;
    if (memory) {
      const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      if (memoryUsage > this.config.alertThresholds.memoryUsage) {
        console.warn('High memory usage detected:', memoryUsage);
      }
    }
  }
}

class UptimeMonitor {
  constructor(config) {
    this.config = config;
    this.isOnline = navigator.onLine;
  }
  
  start() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('Connection restored');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.warn('Connection lost');
    });
  }
}

class ErrorRateMonitor {
  constructor(config) {
    this.config = config;
    this.errors = [];
  }
  
  trackError(error) {
    this.errors.push({
      ...error,
      timestamp: Date.now()
    });
    
    // Clean old errors (keep last hour)
    const oneHourAgo = Date.now() - 3600000;
    this.errors = this.errors.filter(e => e.timestamp > oneHourAgo);
    
    // Check error rate
    const errorRate = this.errors.length / 3600; // errors per second
    if (errorRate > this.config.errorRate) {
      console.error('High error rate detected:', errorRate);
    }
  }
}

// Initialize production configuration
window.ProductionConfig = ProductionConfig;

// Auto-initialize if not in a module environment
if (typeof module === 'undefined') {
  window.shoprProductionConfig = new ProductionConfig();
}