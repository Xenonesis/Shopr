/**
 * Client-side Configuration Script for Shopr Chat SDK
 * This file loads the environment variables from .env and makes them available to the browser
 * In production, this would be generated server-side or by a build process
 */

// Configuration loaded from .env file
window.ENV = {
  // API Configuration from .env
  OPENAI_API_URL: 'https://llm.chutes.ai/v1',
  OPENAI_API_KEY: 'cpk_5872af9cbffc432f96e821da9a402c4c.b387316ab5425cf69f617e4328a3c322.CqR5sx6EoO3i3NLdzTjtLrJgxddXVWTx',
  OPENAI_MODEL_ID: 'zai-org/GLM-4.5-Air',
  
  // Vision API Configuration (using OpenAI for compatibility)
  VISION_API_URL: 'https://api.openai.com/v1',
  VISION_API_KEY: 'your-openai-api-key-here',
  VISION_MODEL_ID: 'gpt-4-vision-preview',
  
  // Speech Recognition API
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
  
  // Debug and Fallback Settings
  DEBUG_MODE: 'false',
  LOG_LEVEL: 'info',
  FALLBACK_TO_MOCK: 'false' // Changed to false since we have a real API configured
};

// Configuration status
window.CONFIG_STATUS = {
  loaded: true,
  source: 'static-config',
  timestamp: new Date().toISOString(),
  realAPIConfigured: true
};

// Notify that configuration is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Dispatch configuration loaded event
  window.dispatchEvent(new CustomEvent('configLoaded', { 
    detail: {
      textAPI: {
        configured: true,
        url: window.ENV.OPENAI_API_URL,
        model: window.ENV.OPENAI_MODEL_ID
      },
      visionAPI: {
        configured: window.ENV.VISION_API_KEY !== 'your-openai-api-key-here',
        url: window.ENV.VISION_API_URL,
        model: window.ENV.VISION_MODEL_ID
      },
      speechAPI: {
        configured: window.ENV.SPEECH_API_KEY !== 'your-openai-api-key-here',
        url: window.ENV.SPEECH_API_URL,
        model: window.ENV.SPEECH_MODEL_ID
      },
      fallbackEnabled: window.ENV.FALLBACK_TO_MOCK === 'true'
    }
  }));
  
  console.log('🚀 Configuration loaded successfully');
  console.log('📊 API Status:', {
    textAPI: 'Configured ✅',
    visionAPI: window.ENV.VISION_API_KEY !== 'your-openai-api-key-here' ? 'Configured ✅' : 'Not configured ⚠️',
    speechAPI: window.ENV.SPEECH_API_KEY !== 'your-openai-api-key-here' ? 'Configured ✅' : 'Not configured ⚠️',
    fallback: window.ENV.FALLBACK_TO_MOCK === 'true' ? 'Enabled' : 'Disabled'
  });
});

// Utility function to update configuration
window.updateConfig = function(newConfig) {
  Object.assign(window.ENV, newConfig);
  
  // Save to localStorage for persistence
  localStorage.setItem('shopr_config_override', JSON.stringify(newConfig));
  
  // Dispatch update event
  window.dispatchEvent(new CustomEvent('configUpdated', { 
    detail: newConfig
  }));
  
  console.log('Configuration updated:', newConfig);
};

// Load any saved configuration overrides
try {
  const savedConfig = localStorage.getItem('shopr_config_override');
  if (savedConfig) {
    const overrides = JSON.parse(savedConfig);
    Object.assign(window.ENV, overrides);
    console.log('Loaded configuration overrides from localStorage');
  }
} catch (error) {
  console.warn('Could not load saved configuration:', error);
}