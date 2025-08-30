/**
 * Configuration Loader for Shopr Chat SDK
 * Loads environment variables and API configuration
 */

class ConfigLoader {
  constructor() {
    this.config = {};
    this.loadEnvironmentConfig();
  }

  async loadEnvironmentConfig() {
    // Load from window.ENV first (set by config.js from .env)
    this.loadFromWindowEnv();
    
    // Try to load from .env file (for development/server environments)
    try {
      await this.loadFromEnvFile();
    } catch (error) {
      console.log('Direct .env file access not available (this is normal in browsers)');
    }
    
    // Load from localStorage (for user preferences and overrides)
    this.loadFromLocalStorage();
    
    // Set defaults for missing values
    this.setDefaults();
    
    // Make config globally available
    window.ENV = this.config;
    
    console.log('🚀 Configuration loaded successfully');
    console.log('📊 Configuration summary:', this.getPublicConfig());
    console.log('🔌 Real API configured:', this.isRealAPIConfigured());
  }

  async loadFromEnvFile() {
    try {
      // In a real application, this would be handled by your build process
      // For demo purposes, we'll simulate loading from .env
      const response = await fetch('.env');
      if (response.ok) {
        const envText = await response.text();
        this.parseEnvText(envText);
      }
    } catch (error) {
      // .env file not accessible from browser, which is expected
      console.log('Environment file not accessible from browser (this is normal)');
    }
  }

  parseEnvText(envText) {
    const lines = envText.split('\n');
    lines.forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          this.config[key] = value;
        }
      }
    });
  }

  loadFromWindowEnv() {
    // Server-side rendered environment variables
    if (window.ENV) {
      Object.assign(this.config, window.ENV);
    }
  }

  loadFromLocalStorage() {
    // User preferences stored in localStorage
    const storedConfig = localStorage.getItem('shopr_api_config');
    if (storedConfig) {
      try {
        const parsed = JSON.parse(storedConfig);
        Object.assign(this.config, parsed);
      } catch (error) {
        console.error('Error parsing stored config:', error);
      }
    }
  }

  setDefaults() {
    const defaults = {
      // OpenAI API Configuration
      OPENAI_API_URL: 'https://api.openai.com/v1',
      OPENAI_API_KEY: 'your-openai-api-key-here',
      OPENAI_MODEL_ID: 'gpt-4o-mini',
      
      // Vision API Configuration
      VISION_API_URL: 'https://api.openai.com/v1',
      VISION_API_KEY: 'your-openai-api-key-here',
      VISION_MODEL_ID: 'gpt-4-vision-preview',
      
      // Speech API Configuration
      SPEECH_API_URL: 'https://api.openai.com/v1',
      SPEECH_API_KEY: 'your-openai-api-key-here',
      SPEECH_MODEL_ID: 'whisper-1',
      
      // API Parameters
      MAX_TOKENS: '1000',
      TEMPERATURE: '0.7',
      TOP_P: '0.9',
      
      // Rate Limiting
      REQUESTS_PER_MINUTE: '60',
      REQUESTS_PER_HOUR: '1000',
      
      // Debug and Fallback
      DEBUG_MODE: 'false',
      LOG_LEVEL: 'info',
      FALLBACK_TO_MOCK: 'true'
    };

    // Set defaults for missing values
    Object.keys(defaults).forEach(key => {
      if (!this.config[key]) {
        this.config[key] = defaults[key];
      }
    });
  }

  getPublicConfig() {
    // Return config without sensitive information for logging
    const publicConfig = { ...this.config };
    
    // Redact API keys
    Object.keys(publicConfig).forEach(key => {
      if (key.includes('API_KEY') || key.includes('KEY')) {
        publicConfig[key] = publicConfig[key] ? '[REDACTED]' : '[NOT SET]';
      }
    });
    
    return publicConfig;
  }

  updateConfig(newConfig) {
    Object.assign(this.config, newConfig);
    window.ENV = this.config;
    
    // Save user preferences to localStorage
    const userPrefs = {};
    Object.keys(newConfig).forEach(key => {
      if (!key.includes('API_KEY')) {
        userPrefs[key] = newConfig[key];
      }
    });
    
    localStorage.setItem('shopr_api_config', JSON.stringify(userPrefs));
    
    console.log('Configuration updated:', this.getPublicConfig());
  }

  isRealAPIConfigured() {
    // Check if we have a valid API key that's not the default placeholder
    const hasValidOpenAI = this.config.OPENAI_API_KEY && 
                          this.config.OPENAI_API_KEY !== 'your-openai-api-key-here' &&
                          this.config.OPENAI_API_KEY !== 'your-api-key-here' &&
                          this.config.OPENAI_API_KEY.length > 10;
    
    // For our demo, we'll also check if we have a configured URL that's not the default
    const hasValidURL = this.config.OPENAI_API_URL && 
                       this.config.OPENAI_API_URL !== 'https://api.openai.com/v1';
    
    // Return true if we have either a valid API key OR a configured custom URL
    const isConfigured = hasValidOpenAI || hasValidURL;
    
    if (isConfigured) {
      console.log('✅ Real API is configured and ready');
    } else {
      console.log('⚠️ Real API not configured, will use mock responses');
    }
    
    return isConfigured;
  }

  getAPIStatus() {
    return {
      textAPI: {
        configured: this.config.OPENAI_API_KEY && this.config.OPENAI_API_KEY !== 'your-openai-api-key-here',
        url: this.config.OPENAI_API_URL,
        model: this.config.OPENAI_MODEL_ID
      },
      visionAPI: {
        configured: this.config.VISION_API_KEY && this.config.VISION_API_KEY !== 'your-openai-api-key-here',
        url: this.config.VISION_API_URL,
        model: this.config.VISION_MODEL_ID
      },
      speechAPI: {
        configured: this.config.SPEECH_API_KEY && this.config.SPEECH_API_KEY !== 'your-openai-api-key-here',
        url: this.config.SPEECH_API_URL,
        model: this.config.SPEECH_MODEL_ID
      },
      fallbackEnabled: this.config.FALLBACK_TO_MOCK === 'true'
    };
  }

  // Preset configurations for popular providers
  setOpenAIConfig(apiKey) {
    this.updateConfig({
      OPENAI_API_URL: 'https://api.openai.com/v1',
      OPENAI_API_KEY: apiKey,
      OPENAI_MODEL_ID: 'gpt-4o-mini',
      VISION_API_URL: 'https://api.openai.com/v1',
      VISION_API_KEY: apiKey,
      VISION_MODEL_ID: 'gpt-4-vision-preview',
      SPEECH_API_URL: 'https://api.openai.com/v1',
      SPEECH_API_KEY: apiKey,
      SPEECH_MODEL_ID: 'whisper-1'
    });
  }

  setAnthropicConfig(apiKey) {
    this.updateConfig({
      OPENAI_API_URL: 'https://api.anthropic.com/v1',
      OPENAI_API_KEY: apiKey,
      OPENAI_MODEL_ID: 'claude-3-sonnet-20240229',
      FALLBACK_TO_MOCK: 'true' // Vision not supported, fallback for images
    });
  }

  setGoogleConfig(apiKey) {
    this.updateConfig({
      OPENAI_API_URL: 'https://generativelanguage.googleapis.com/v1beta',
      OPENAI_API_KEY: apiKey,
      OPENAI_MODEL_ID: 'gemini-pro',
      VISION_API_URL: 'https://generativelanguage.googleapis.com/v1beta',
      VISION_API_KEY: apiKey,
      VISION_MODEL_ID: 'gemini-pro-vision'
    });
  }

  setLocalConfig(url = 'http://localhost:11434/v1', model = 'llama2') {
    this.updateConfig({
      OPENAI_API_URL: url,
      OPENAI_API_KEY: 'not-required-for-local',
      OPENAI_MODEL_ID: model,
      FALLBACK_TO_MOCK: 'true' // Local models may not support all features
    });
  }

  setAzureConfig(resourceName, deploymentName, apiKey) {
    this.updateConfig({
      OPENAI_API_URL: `https://${resourceName}.openai.azure.com/openai/deployments/${deploymentName}`,
      OPENAI_API_KEY: apiKey,
      OPENAI_MODEL_ID: 'gpt-4',
      VISION_API_URL: `https://${resourceName}.openai.azure.com/openai/deployments/${deploymentName}`,
      VISION_API_KEY: apiKey,
      VISION_MODEL_ID: 'gpt-4-vision'
    });
  }
}

// Initialize configuration loader
window.configLoader = new ConfigLoader();

// Load configuration when script loads
document.addEventListener('DOMContentLoaded', async function() {
  await window.configLoader.loadEnvironmentConfig();
  
  // Dispatch event when config is loaded
  window.dispatchEvent(new CustomEvent('configLoaded', { 
    detail: window.configLoader.getAPIStatus() 
  }));
});