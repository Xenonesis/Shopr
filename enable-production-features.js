/**
 * Production Features Enabler for Shopr Chat SDK
 * Simple script to enable all production-grade features
 */

(function() {
  'use strict';

  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.error('Production features can only be enabled in a browser environment');
    return;
  }

  console.log('🚀 Enabling Shopr Production Features...');

  // Load production scripts dynamically
  const productionScripts = [
    './production-config.js',
    './assets/js/production-analytics.js',
    './assets/js/security-manager.js',
    './assets/js/personalization-engine.js'
  ];

  let scriptsLoaded = 0;
  const totalScripts = productionScripts.length;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        console.log(`✅ Script already loaded: ${src}`);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      script.onload = () => {
        scriptsLoaded++;
        console.log(`✅ Loaded (${scriptsLoaded}/${totalScripts}): ${src}`);
        resolve();
      };
      
      script.onerror = () => {
        console.error(`❌ Failed to load: ${src}`);
        reject(new Error(`Failed to load script: ${src}`));
      };
      
      document.head.appendChild(script);
    });
  }

  // Load all production scripts
  Promise.all(productionScripts.map(loadScript))
    .then(() => {
      console.log('🎉 All production scripts loaded successfully!');
      
      // Wait a bit for scripts to initialize
      setTimeout(() => {
        initializeProductionFeatures();
      }, 1000);
    })
    .catch((error) => {
      console.error('💥 Failed to load production scripts:', error);
      console.log('🎭 Falling back to basic functionality...');
    });

  function initializeProductionFeatures() {
    try {
      // Check if production classes are available
      const hasProductionConfig = typeof window.ProductionConfig !== 'undefined';
      const hasAnalytics = typeof window.ProductionAnalytics !== 'undefined';
      const hasSecurity = typeof window.SecurityManager !== 'undefined';
      const hasPersonalization = typeof window.PersonalizationEngine !== 'undefined';

      console.log('🔍 Production Features Status:');
      console.log(`  📊 Analytics: ${hasAnalytics ? '✅' : '❌'}`);
      console.log(`  🔒 Security: ${hasSecurity ? '✅' : '❌'}`);
      console.log(`  🧠 Personalization: ${hasPersonalization ? '✅' : '❌'}`);
      console.log(`  ⚙️ Configuration: ${hasProductionConfig ? '✅' : '❌'}`);

      // Initialize production configuration first
      if (hasProductionConfig && !window.shoprProductionConfig) {
        window.shoprProductionConfig = new window.ProductionConfig();
        console.log('⚙️ Production configuration initialized');
      }

      // Initialize analytics
      if (hasAnalytics && !window.shoprAnalytics) {
        window.shoprAnalytics = new window.ProductionAnalytics({
          enableErrorTracking: true,
          enablePerformanceTracking: true,
          enableUserBehaviorTracking: true,
          debug: window.shoprProductionConfig?.isDevelopment() || false
        });
        console.log('📊 Production analytics initialized');
      }

      // Initialize security
      if (hasSecurity && !window.shoprSecurity) {
        window.shoprSecurity = new window.SecurityManager({
          threatDetection: true,
          encryption: true,
          logging: true,
          debug: window.shoprProductionConfig?.isDevelopment() || false
        });
        console.log('🔒 Security manager initialized');
      }

      // Initialize personalization
      if (hasPersonalization && !window.shoprPersonalization) {
        window.shoprPersonalization = new window.PersonalizationEngine({
          userProfiling: true,
          behaviorAnalysis: true,
          recommendations: true,
          realTimeAdaptation: true,
          abTesting: true
        });
        console.log('🧠 Personalization engine initialized');
      }

      // Enhance existing chat SDK if available
      if (window.shoprChat) {
        enhanceExistingChatSDK();
      } else {
        // Wait for chat SDK to load
        const checkForChatSDK = setInterval(() => {
          if (window.shoprChat) {
            clearInterval(checkForChatSDK);
            enhanceExistingChatSDK();
          }
        }, 500);

        // Stop checking after 10 seconds
        setTimeout(() => {
          clearInterval(checkForChatSDK);
          if (!window.shoprChat) {
            console.log('⚠️ Chat SDK not found - production features available globally');
          }
        }, 10000);
      }

      // Set up global production utilities
      setupGlobalUtilities();

      console.log('🎉 Production features enabled successfully!');
      
      // Dispatch event for other scripts to listen to
      window.dispatchEvent(new CustomEvent('shoprProductionReady', {
        detail: {
          analytics: hasAnalytics,
          security: hasSecurity,
          personalization: hasPersonalization,
          configuration: hasProductionConfig
        }
      }));

    } catch (error) {
      console.error('💥 Error initializing production features:', error);
    }
  }

  function enhanceExistingChatSDK() {
    try {
      // Add production systems to existing chat SDK
      if (window.shoprAnalytics) {
        window.shoprChat.analytics = window.shoprAnalytics;
      }
      
      if (window.shoprSecurity) {
        window.shoprChat.security = window.shoprSecurity;
      }
      
      if (window.shoprPersonalization) {
        window.shoprChat.personalization = window.shoprPersonalization;
      }
      
      if (window.shoprProductionConfig) {
        window.shoprChat.productionConfig = window.shoprProductionConfig;
      }

      console.log('🔗 Enhanced existing chat SDK with production features');

      // Track chat SDK enhancement
      if (window.shoprAnalytics) {
        window.shoprAnalytics.trackEvent({
          type: 'production_enhancement',
          component: 'chat_sdk',
          timestamp: Date.now()
        });
      }

    } catch (error) {
      console.error('💥 Error enhancing chat SDK:', error);
    }
  }

  function setupGlobalUtilities() {
    // Create global production utilities
    window.ShoprProduction = {
      // Get production status
      getStatus: () => ({
        analytics: !!window.shoprAnalytics,
        security: !!window.shoprSecurity,
        personalization: !!window.shoprPersonalization,
        configuration: !!window.shoprProductionConfig,
        chatSDK: !!window.shoprChat
      }),

      // Get performance metrics
      getMetrics: () => {
        if (!window.shoprAnalytics) return null;
        return window.shoprAnalytics.getSessionInfo();
      },

      // Get security status
      getSecurityStatus: () => {
        if (!window.shoprSecurity) return null;
        return window.shoprSecurity.getSecurityStatus();
      },

      // Get personalization insights
      getPersonalizationInsights: (userId) => {
        if (!window.shoprPersonalization) return null;
        return window.shoprPersonalization.getUserInsights(userId);
      },

      // Enable debug mode
      enableDebug: () => {
        if (window.shoprAnalytics) window.shoprAnalytics.config.debug = true;
        if (window.shoprSecurity) window.shoprSecurity.config.debug = true;
        console.log('🐛 Debug mode enabled for all production systems');
      },

      // Disable debug mode
      disableDebug: () => {
        if (window.shoprAnalytics) window.shoprAnalytics.config.debug = false;
        if (window.shoprSecurity) window.shoprSecurity.config.debug = false;
        console.log('🔇 Debug mode disabled for all production systems');
      },

      // Get configuration
      getConfig: () => {
        if (!window.shoprProductionConfig) return null;
        return window.shoprProductionConfig.getPublicConfig();
      },

      // Health check
      healthCheck: () => {
        const status = window.ShoprProduction.getStatus();
        const allSystemsOperational = Object.values(status).every(Boolean);
        
        return {
          healthy: allSystemsOperational,
          systems: status,
          timestamp: Date.now(),
          environment: window.shoprProductionConfig?.getEnvironment() || 'unknown'
        };
      }
    };

    // Add development helpers
    if (window.shoprProductionConfig?.isDevelopment()) {
      window.ShoprDev = {
        // Clear all data
        clearAllData: () => {
          localStorage.clear();
          sessionStorage.clear();
          console.log('🧹 All local data cleared');
        },

        // Simulate user interactions
        simulateUser: (actions = 10) => {
          console.log(`🎭 Simulating ${actions} user interactions...`);
          // Implementation would go here
        },

        // Test security
        testSecurity: () => {
          if (window.shoprSecurity) {
            console.log('🔒 Running security tests...');
            // Implementation would go here
          }
        },

        // Generate test data
        generateTestData: () => {
          console.log('📊 Generating test data...');
          // Implementation would go here
        }
      };

      console.log('🛠️ Development utilities available as window.ShoprDev');
    }

    console.log('🌐 Global production utilities available as window.ShoprProduction');
  }

  // Add CSS for production features if not already present
  function addProductionCSS() {
    if (document.querySelector('#shopr-production-css')) return;

    const css = `
      /* Production Features CSS */
      .shopr-production-status {
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 10000;
        font-family: monospace;
      }
      
      .shopr-production-status.healthy {
        background: rgba(0, 128, 0, 0.8);
      }
      
      .shopr-production-status.warning {
        background: rgba(255, 165, 0, 0.8);
      }
      
      .shopr-production-status.error {
        background: rgba(255, 0, 0, 0.8);
      }
    `;

    const style = document.createElement('style');
    style.id = 'shopr-production-css';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // Add production status indicator in development
  function addStatusIndicator() {
    if (window.shoprProductionConfig?.isProduction()) return;

    const indicator = document.createElement('div');
    indicator.className = 'shopr-production-status';
    indicator.id = 'shopr-status-indicator';
    indicator.textContent = '🚀 Production Features Loading...';
    document.body.appendChild(indicator);

    // Update status periodically
    const updateStatus = () => {
      const health = window.ShoprProduction?.healthCheck();
      if (health) {
        indicator.className = `shopr-production-status ${health.healthy ? 'healthy' : 'error'}`;
        indicator.textContent = `🚀 ${health.healthy ? 'All Systems Operational' : 'System Issues Detected'}`;
      }
    };

    // Update every 5 seconds
    setInterval(updateStatus, 5000);
    
    // Initial update after 2 seconds
    setTimeout(updateStatus, 2000);
  }

  // Initialize CSS and status indicator
  addProductionCSS();
  
  // Add status indicator after a delay
  setTimeout(addStatusIndicator, 1500);

})();