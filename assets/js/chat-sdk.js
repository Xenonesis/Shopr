/**
 * Shopr Chat SDK - Multi-modal Product Search and Recommendation System
 * Supports text, image, and voice queries with personalized recommendations
 */

class ShoprChatSDK {
  constructor(config = {}) {
    this.config = {
      apiKey: config.apiKey || 'demo-api-key',
      baseUrl: config.baseUrl || 'https://api.shopr.com',
      position: config.position || 'bottom-right',
      primaryColor: config.primaryColor || '#ff6b6b',
      secondaryColor: config.secondaryColor || '#4ecdc4',
      enableVoice: config.enableVoice !== false,
      enableImage: config.enableImage !== false,
      languages: config.languages || ['en', 'hi', 'ar'],
      userId: config.userId || this.generateUserId(),
      ...config
    };

    this.isOpen = false;
    this.isListening = false;
    this.recognition = null;
    this.currentLanguage = 'en';
    this.chatHistory = [];
    this.userProfile = this.loadUserProfile();
    
    // Initialize API Service (Real or Mock based on configuration)
    this.initializeAPIService();
    
    // Initialize Advanced AI Personality
    this.aiPersonality = new window.AdvancedAIPersonality();

    this.init();
  }

  init() {
    this.createChatWidget();
    this.setupEventListeners();
    this.initSpeechRecognition();
    this.loadChatHistory();
    this.setupConfigurationListener();
  }

  initializeAPIService() {
    // Check if configuration is loaded and real API is configured
    if (window.ENV && window.configLoader && window.configLoader.isRealAPIConfigured()) {
      console.log('🚀 Initializing Real API Service with AI integration');
      console.log('  • API URL:', window.ENV.OPENAI_API_URL);
      console.log('  • Model:', window.ENV.OPENAI_MODEL_ID);
      console.log('  • Fallback enabled:', window.ENV.FALLBACK_TO_MOCK === 'true');
      
      this.apiService = new window.RealAPIService();
      this.usingRealAPI = true;
      
      // Add a welcome message about real API
      setTimeout(() => {
        this.addMessage('bot', 
          '🚀 <strong>Real AI Activated!</strong><br>' +
          'I\'m now powered by advanced AI and ready to help you find the perfect products. ' +
          'Try asking me things like:<br>' +
          '• "Show me winter jackets for men"<br>' +
          '• "I need a dress for a wedding"<br>' +
          '• "Find me comfortable running shoes"<br>' +
          'I can also analyze images you upload! 📸', 
          'system'
        );
      }, 1000);
      
    } else {
      console.log('🎭 Using Mock API Service (demo mode)');
      console.log('  • Reason: Real API not configured or not available');
      
      this.apiService = new window.MockAPIService();
      this.usingRealAPI = false;
      
      // Add a message about demo mode
      setTimeout(() => {
        this.addMessage('bot', 
          '🎭 <strong>Demo Mode Active</strong><br>' +
          'I\'m running in demonstration mode with pre-programmed responses. ' +
          'For real AI-powered assistance, please configure your API settings. ' +
          '<a href="#" onclick="window.shoprChat.showAPIConfig()" style="color: var(--salmon-pink); text-decoration: underline;">Click here to set up real AI</a>', 
          'system'
        );
      }, 1000);
    }
  }

  setupConfigurationListener() {
    // Listen for configuration changes
    window.addEventListener('configLoaded', (event) => {
      this.handleConfigurationUpdate(event.detail);
    });

    window.addEventListener('configUpdated', (event) => {
      this.handleConfigurationUpdate(event.detail);
    });
  }

  handleConfigurationUpdate(apiStatus) {
    const wasUsingRealAPI = this.usingRealAPI;
    
    // Reinitialize API service based on new configuration
    this.initializeAPIService();
    
    // Notify user if API service changed
    if (wasUsingRealAPI !== this.usingRealAPI) {
      const message = this.usingRealAPI 
        ? "🚀 Switched to Real AI API! You'll now get intelligent responses powered by advanced AI."
        : "🎭 Switched to Demo Mode. Configure your API key to enable real AI responses.";
      
      this.addMessage('bot', message, 'system');
    }

    // Update welcome message if needed
    this.updateWelcomeMessage();
  }

  updateWelcomeMessage() {
    const welcomeMessage = document.querySelector('.welcome-message .message-content');
    if (welcomeMessage) {
      const apiStatus = this.usingRealAPI ? 
        '<div class="api-status real-api">🚀 <strong>Real AI Powered</strong> - Advanced intelligence enabled!</div>' :
        '<div class="api-status demo-api">🎭 <strong>Demo Mode</strong> - <a href="#" onclick="window.shoprChat.showAPIConfig()">Configure API</a> for real AI responses</div>';
      
      // Add API status to welcome message if not already present
      if (!welcomeMessage.querySelector('.api-status')) {
        welcomeMessage.insertAdjacentHTML('beforeend', apiStatus);
      }
    }
  }

  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  loadUserProfile() {
    const stored = localStorage.getItem('shopr_user_profile');
    return stored ? JSON.parse(stored) : {
      orders: [],
      clickHistory: [],
      preferences: {},
      searchHistory: []
    };
  }

  saveUserProfile() {
    localStorage.setItem('shopr_user_profile', JSON.stringify(this.userProfile));
  }

  createChatWidget() {
    // Create chat bubble
    const chatBubble = document.createElement('div');
    chatBubble.className = 'shopr-chat-bubble';
    chatBubble.innerHTML = `
      <div class="chat-bubble-icon">
        <ion-icon name="chatbubble-ellipses-outline"></ion-icon>
        <span class="notification-dot"></span>
      </div>
    `;

    // Create chat widget
    const chatWidget = document.createElement('div');
    chatWidget.className = 'shopr-chat-widget';
    chatWidget.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-avatar">
            <img src="./assets/images/logo/logo.svg" alt="Shopr Assistant" />
          </div>
          <div class="chat-title">
            <h3>Shopr Assistant</h3>
            <span class="chat-status">Online</span>
          </div>
        </div>
        <div class="chat-controls">
          <button class="chat-minimize-btn" title="Minimize">
            <ion-icon name="remove-outline"></ion-icon>
          </button>
          <button class="chat-close-btn" title="Close">
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
      </div>

      <div class="chat-messages" id="chatMessages">
        <div class="welcome-message">
          <div class="message bot-message">
            <div class="message-content">
              <p>✨ Hey there! I'm Aria, your personal shopping assistant! Ready to find something amazing?</p>
              <div class="ai-capabilities">
                <p>🌟 I'm here to help you discover your perfect style using:</p>
                <ul>
                  <li>💬 <strong>Smart Conversations</strong> - Just tell me what you're looking for!</li>
                  <li>📷 <strong>Visual Search</strong> - Upload any image and I'll find similar items</li>
                  <li>🎤 <strong>Voice Shopping</strong> - Speak in English, Hindi, or Arabic</li>
                  <li>🧠 <strong>AI Recommendations</strong> - Personalized suggestions just for you</li>
                </ul>
                <div class="personality-intro">
                  <p>💖 I'm enthusiastic about fashion, knowledgeable about trends, and absolutely love helping you find pieces that make you shine! What's your style vibe today?</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input-container">
        <div class="chat-input-wrapper">
          <button class="input-action-btn image-upload-btn" title="Upload Image">
            <ion-icon name="camera-outline"></ion-icon>
            <input type="file" accept="image/*" class="image-input" style="display: none;">
          </button>
          
          <input type="text" class="chat-input" placeholder="Type your message or product query..." />
          
          <div class="voice-controls">
            <select class="language-selector" title="Select Language">
              <option value="en">🇺🇸 EN</option>
              <option value="hi">🇮🇳 HI</option>
              <option value="ar">🇸🇦 AR</option>
            </select>
            <button class="input-action-btn voice-btn" title="Voice Input">
              <ion-icon name="mic-outline"></ion-icon>
            </button>
          </div>
          
          <button class="send-btn" title="Send Message">
            <ion-icon name="send-outline"></ion-icon>
          </button>
        </div>
        
        <div class="quick-actions">
          <button class="quick-action-btn" data-query="Show me trending products">🔥 Trending</button>
          <button class="quick-action-btn" data-query="New arrivals">✨ New Arrivals</button>
          <button class="quick-action-btn" data-query="Best deals">💰 Best Deals</button>
          <button class="quick-action-btn" data-query="Recommended for me">👤 For Me</button>
        </div>
      </div>
    `;

    // Apply positioning
    chatBubble.classList.add(`position-${this.config.position}`);
    chatWidget.classList.add(`position-${this.config.position}`);

    // Add to DOM
    document.body.appendChild(chatBubble);
    document.body.appendChild(chatWidget);

    this.chatBubble = chatBubble;
    this.chatWidget = chatWidget;
    this.chatMessages = chatWidget.querySelector('#chatMessages');
    this.chatInput = chatWidget.querySelector('.chat-input');
  }

  setupEventListeners() {
    // Chat bubble click
    this.chatBubble.addEventListener('click', () => this.toggleChat());

    // Close and minimize buttons
    this.chatWidget.querySelector('.chat-close-btn').addEventListener('click', () => this.closeChat());
    this.chatWidget.querySelector('.chat-minimize-btn').addEventListener('click', () => this.minimizeChat());

    // Send button and enter key
    this.chatWidget.querySelector('.send-btn').addEventListener('click', () => this.sendMessage());
    this.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // Voice button
    const voiceBtn = this.chatWidget.querySelector('.voice-btn');
    voiceBtn.addEventListener('click', () => this.toggleVoiceInput());

    // Language selector
    const languageSelector = this.chatWidget.querySelector('.language-selector');
    languageSelector.addEventListener('change', (e) => {
      this.currentLanguage = e.target.value;
    });

    // Image upload
    const imageUploadBtn = this.chatWidget.querySelector('.image-upload-btn');
    const imageInput = this.chatWidget.querySelector('.image-input');
    
    imageUploadBtn.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', (e) => this.handleImageUpload(e));

    // Quick actions
    const quickActionBtns = this.chatWidget.querySelectorAll('.quick-action-btn');
    quickActionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        this.chatInput.value = query;
        this.sendMessage();
      });
    });
  }

  initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    
    this.recognition.onstart = () => {
      this.isListening = true;
      this.updateVoiceButton();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.updateVoiceButton();
    };

    this.recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      this.chatInput.value = transcript;
      
      // Add user message for voice input
      this.addMessage('user', `🎤 "${transcript}"`, 'voice');
      this.chatInput.value = '';

      // Show typing indicator
      this.showTypingIndicator();

      try {
        // Process voice query through API service
        const result = await this.apiService.processVoiceQuery(transcript, this.currentLanguage, this.config.userId);
        this.hideTypingIndicator();
        this.addMessage('bot', this.formatProductResponse(result.message, this.formatProductsForDisplay(result.products)), 'text');
      } catch (error) {
        this.hideTypingIndicator();
        this.addMessage('bot', 'Sorry, I had trouble processing your voice command. Please try again.', 'text');
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      this.updateVoiceButton();
    };
  }

  toggleVoiceInput() {
    if (!this.recognition) return;

    if (this.isListening) {
      this.recognition.stop();
    } else {
      this.recognition.lang = this.getLanguageCode(this.currentLanguage);
      this.recognition.start();
    }
  }

  getLanguageCode(lang) {
    const langCodes = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'ar': 'ar-SA'
    };
    return langCodes[lang] || 'en-US';
  }

  updateVoiceButton() {
    const voiceBtn = this.chatWidget.querySelector('.voice-btn');
    const icon = voiceBtn.querySelector('ion-icon');
    
    if (this.isListening) {
      voiceBtn.classList.add('listening');
      icon.setAttribute('name', 'stop-outline');
    } else {
      voiceBtn.classList.remove('listening');
      icon.setAttribute('name', 'mic-outline');
    }
  }

  async handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Show image preview in chat
    const imageUrl = URL.createObjectURL(file);
    this.addMessage('user', `<img src="${imageUrl}" alt="Uploaded image" class="uploaded-image" />`, 'image');

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Simulate image processing
      await this.delay(2000);
      
      // Mock image recognition response
      const response = await this.processImageQuery(file);
      this.hideTypingIndicator();
      this.addMessage('bot', response, 'text');
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage('bot', 'Sorry, I had trouble processing your image. Please try again.', 'text');
    }

    // Clear file input
    event.target.value = '';
  }

  async processImageQuery(imageFile) {
    try {
      // AI personality response for image upload
      const personalityResponse = this.aiPersonality.generatePersonalizedResponse("image upload", {
        userHistory: this.userProfile.searchHistory,
        currentTime: new Date(),
        queryType: 'image'
      });

      const result = await this.apiService.processImageQuery(imageFile, this.config.userId);
      
      // Track the image query
      this.apiService.trackQuery(this.config.userId, 'image_upload', 'image', result.products);
      
      // Enhanced message with AI personality
      let enhancedMessage = `📸 ${personalityResponse.personality} I love visual shopping! Let me analyze this image for you...`;
      enhancedMessage += `\n\n${result.message}`;
      
      // Add style insights for image-based search
      const imageInsights = [
        "🎨 Visual search is so powerful - I can spot style details you might miss!",
        "👀 I'm analyzing colors, patterns, and silhouettes to find perfect matches!",
        "✨ Great choice using image search - it's like having a fashion detective!"
      ];
      
      enhancedMessage += `\n\n💡 **Aria's Visual Analysis:**\n${this.getRandomFromArray(imageInsights)}`;
      
      if (result.confidence && result.confidence > 0.8) {
        enhancedMessage += `\n🎯 I'm ${Math.round(result.confidence * 100)}% confident about these matches!`;
      }
      
      return this.formatProductResponse(enhancedMessage, this.formatProductsForDisplay(result.products));
    } catch (error) {
      console.error('Image processing error:', error);
      
      const errorResponse = this.aiPersonality.respondToUserEmotion('frustrated');
      return `${errorResponse}\n\n📷 Try uploading a clearer image, or describe what you're looking for instead! I'm great with both! 💪`;
    }
  }

  getRandomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  async sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message) return;

    // Add user message
    this.addMessage('user', message, 'text');
    this.chatInput.value = '';

    // Add to search history
    this.userProfile.searchHistory.push({
      query: message,
      timestamp: new Date().toISOString(),
      type: 'text'
    });
    this.saveUserProfile();

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Process the query
      const response = await this.processTextQuery(message);
      this.hideTypingIndicator();
      this.addMessage('bot', response, 'text');
    } catch (error) {
      this.hideTypingIndicator();
      this.addMessage('bot', 'Sorry, I encountered an error. Please try again.', 'text');
    }
  }

  async processTextQuery(query) {
    try {
      // Get AI personality response
      const personalityResponse = this.aiPersonality.generatePersonalizedResponse(query, {
        userHistory: this.userProfile.searchHistory,
        currentTime: new Date(),
        conversationContext: this.chatHistory.slice(-3)
      });

      // Get product results from API
      const result = await this.apiService.processTextQuery(query, this.config.userId);
      
      // Track the text query
      this.apiService.trackQuery(this.config.userId, query, 'text', result.products);
      
      // Combine AI personality with product results
      let enhancedMessage = personalityResponse.message;
      
      if (result.products.length > 0) {
        enhancedMessage += `\n\n${result.message}`;
        
        // Add AI insights about the products
        if (personalityResponse.insights.length > 0) {
          enhancedMessage += `\n\n💡 **Aria's Style Insights:**\n${personalityResponse.insights.join('\n')}`;
        }
        
        // Add personalized recommendations
        if (personalityResponse.recommendations.length > 0) {
          enhancedMessage += `\n\n✨ **Personal Recommendations:**\n${personalityResponse.recommendations.join('\n')}`;
        }
        
        return this.formatProductResponse(enhancedMessage, this.formatProductsForDisplay(result.products));
      } else {
        // No products found, provide helpful AI response
        enhancedMessage += "\n\n🤔 Hmm, I didn't find exact matches, but let me suggest some alternatives that might spark your interest!";
        
        // Get trending products as alternatives
        const trendingProducts = this.apiService.getTrendingProducts();
        return this.formatProductResponse(enhancedMessage, this.formatProductsForDisplay(trendingProducts.slice(0, 4)));
      }
      
    } catch (error) {
      console.error('Text processing error:', error);
      
      // Even errors get personality!
      const errorResponse = this.aiPersonality.respondToUserEmotion('frustrated');
      return `${errorResponse}\n\nLet me try a different approach - what specific type of item are you looking for? 🔍`;
    }
  }


  formatProductResponse(message, products) {
    let html = `<p>${message}</p><div class="product-grid">`;
    
    products.forEach(product => {
      html += `
        <div class="product-card" data-product-id="${product.id}">
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}" />
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
          </div>
          <div class="product-info">
            <h4 class="product-name">${product.name}</h4>
            <div class="product-price">
              <span class="current-price">${product.price}</span>
              ${product.originalPrice ? `<span class="original-price">${product.originalPrice}</span>` : ''}
            </div>
            ${product.rating ? `
              <div class="product-rating">
                ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                <span>(${product.rating})</span>
              </div>
            ` : ''}
            <button class="product-view-btn" onclick="window.shoprChat.viewProduct(${product.id})">
              View Product
            </button>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  }

  formatProductsForDisplay(products) {
    return products.map(product => ({
      id: product.id,
      name: product.name,
      price: `₹${product.price.toLocaleString()}`,
      originalPrice: product.originalPrice ? `₹${product.originalPrice.toLocaleString()}` : null,
      image: product.image,
      rating: product.rating,
      badge: product.trending ? "🔥 Trending" : 
             product.bestDeal ? "💰 Best Deal" : 
             product.originalPrice ? `${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF` : null
    }));
  }

  viewProduct(productId) {
    // Track click for personalization using API service
    this.apiService.trackProductClick(this.config.userId, productId);
    
    // Also update local user profile
    this.userProfile.clickHistory.push({
      productId,
      timestamp: new Date().toISOString()
    });
    this.saveUserProfile();

    // Navigate to the actual product detail page
    this.addMessage('bot', `🛍️ Opening product details...`, 'text');
    
    // Small delay for better UX, then navigate
    setTimeout(() => {
      window.open(`product-detail.html?id=${productId}`, '_blank');
    }, 500);
  }

  addMessage(sender, content, type = 'text') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
      <div class="message-content">
        ${content}
      </div>
      <div class="message-time">${timestamp}</div>
    `;

    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();

    // Save to chat history
    this.chatHistory.push({
      sender,
      content,
      type,
      timestamp: new Date().toISOString()
    });
    this.saveChatHistory();
  }

  showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message typing-indicator';
    typingDiv.innerHTML = `
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    
    this.chatMessages.appendChild(typingDiv);
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    const typingIndicator = this.chatMessages.querySelector('.typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat() {
    this.isOpen = true;
    this.chatWidget.classList.add('open');
    this.chatBubble.classList.add('hidden');
    this.chatInput.focus();
  }

  closeChat() {
    this.isOpen = false;
    this.chatWidget.classList.remove('open');
    this.chatBubble.classList.remove('hidden');
  }

  minimizeChat() {
    this.closeChat();
  }

  loadChatHistory() {
    const stored = localStorage.getItem('shopr_chat_history');
    if (stored) {
      this.chatHistory = JSON.parse(stored);
      // Optionally restore recent messages
    }
  }

  saveChatHistory() {
    localStorage.setItem('shopr_chat_history', JSON.stringify(this.chatHistory));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  showAPIConfig() {
    this.createAPIConfigModal();
  }

  createAPIConfigModal() {
    // Remove existing modal if present
    const existingModal = document.querySelector('.api-config-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'api-config-modal';
    modal.innerHTML = `
      <div class="api-config-overlay"></div>
      <div class="api-config-content">
        <div class="api-config-header">
          <h2>🚀 Configure Real AI API</h2>
          <button class="api-config-close">&times;</button>
        </div>
        
        <div class="api-config-body">
          <div class="api-status-display">
            <h3>Current Status</h3>
            <div class="status-grid" id="apiStatusGrid">
              <!-- Status will be populated by JavaScript -->
            </div>
          </div>

          <div class="api-config-tabs">
            <button class="tab-btn active" data-tab="openai">OpenAI</button>
            <button class="tab-btn" data-tab="anthropic">Anthropic</button>
            <button class="tab-btn" data-tab="google">Google</button>
            <button class="tab-btn" data-tab="local">Local LLM</button>
            <button class="tab-btn" data-tab="custom">Custom</button>
          </div>

          <div class="api-config-forms">
            <!-- OpenAI Configuration -->
            <div class="config-form active" id="openai-form">
              <h3>🤖 OpenAI Configuration</h3>
              <div class="form-group">
                <label>API Key:</label>
                <input type="password" id="openai-key" placeholder="sk-..." />
                <small>Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a></small>
              </div>
              <button class="config-save-btn" onclick="window.shoprChat.saveOpenAIConfig()">Save OpenAI Config</button>
            </div>

            <!-- Anthropic Configuration -->
            <div class="config-form" id="anthropic-form">
              <h3>🧠 Anthropic Claude Configuration</h3>
              <div class="form-group">
                <label>API Key:</label>
                <input type="password" id="anthropic-key" placeholder="sk-ant-..." />
                <small>Get your API key from <a href="https://console.anthropic.com/" target="_blank">Anthropic Console</a></small>
              </div>
              <button class="config-save-btn" onclick="window.shoprChat.saveAnthropicConfig()">Save Anthropic Config</button>
            </div>

            <!-- Google Configuration -->
            <div class="config-form" id="google-form">
              <h3>🌟 Google Gemini Configuration</h3>
              <div class="form-group">
                <label>API Key:</label>
                <input type="password" id="google-key" placeholder="AIza..." />
                <small>Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a></small>
              </div>
              <button class="config-save-btn" onclick="window.shoprChat.saveGoogleConfig()">Save Google Config</button>
            </div>

            <!-- Local LLM Configuration -->
            <div class="config-form" id="local-form">
              <h3>🏠 Local LLM Configuration</h3>
              <div class="form-group">
                <label>API URL:</label>
                <input type="text" id="local-url" placeholder="http://localhost:11434/v1" value="http://localhost:11434/v1" />
              </div>
              <div class="form-group">
                <label>Model Name:</label>
                <input type="text" id="local-model" placeholder="llama2" value="llama2" />
              </div>
              <small>For Ollama, LM Studio, or other local LLM servers</small>
              <button class="config-save-btn" onclick="window.shoprChat.saveLocalConfig()">Save Local Config</button>
            </div>

            <!-- Custom Configuration -->
            <div class="config-form" id="custom-form">
              <h3>⚙️ Custom API Configuration</h3>
              <div class="form-group">
                <label>API URL:</label>
                <input type="text" id="custom-url" placeholder="https://api.example.com/v1" />
              </div>
              <div class="form-group">
                <label>API Key:</label>
                <input type="password" id="custom-key" placeholder="your-api-key" />
              </div>
              <div class="form-group">
                <label>Model ID:</label>
                <input type="text" id="custom-model" placeholder="gpt-4" />
              </div>
              <button class="config-save-btn" onclick="window.shoprChat.saveCustomConfig()">Save Custom Config</button>
            </div>
          </div>

          <div class="api-config-footer">
            <p><strong>Note:</strong> Your API keys are stored locally in your browser and never sent to our servers.</p>
            <button class="demo-mode-btn" onclick="window.shoprChat.enableDemoMode()">Use Demo Mode</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.setupAPIConfigModal(modal);
    this.updateAPIStatusDisplay();
  }

  setupAPIConfigModal(modal) {
    // Close modal functionality
    const closeBtn = modal.querySelector('.api-config-close');
    const overlay = modal.querySelector('.api-config-overlay');
    
    const closeModal = () => modal.remove();
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    // Tab switching
    const tabBtns = modal.querySelectorAll('.tab-btn');
    const forms = modal.querySelectorAll('.config-form');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        
        // Update active tab
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show corresponding form
        forms.forEach(form => {
          form.classList.remove('active');
          if (form.id === `${tabName}-form`) {
            form.classList.add('active');
          }
        });
      });
    });

    // Load current values
    this.loadCurrentConfigValues();
  }

  loadCurrentConfigValues() {
    if (!window.configLoader) return;

    const config = window.configLoader.config;
    
    // Load OpenAI values
    if (config.OPENAI_API_KEY && config.OPENAI_API_KEY !== 'your-openai-api-key-here') {
      document.getElementById('openai-key').value = config.OPENAI_API_KEY;
    }
    
    // Load other provider values similarly
    if (config.OPENAI_API_URL && config.OPENAI_API_URL.includes('localhost')) {
      document.getElementById('local-url').value = config.OPENAI_API_URL;
      document.getElementById('local-model').value = config.OPENAI_MODEL_ID;
    }
  }

  updateAPIStatusDisplay() {
    const statusGrid = document.getElementById('apiStatusGrid');
    if (!statusGrid || !window.configLoader) return;

    const status = window.configLoader.getAPIStatus();
    
    statusGrid.innerHTML = `
      <div class="status-item ${status.textAPI.configured ? 'configured' : 'not-configured'}">
        <div class="status-icon">${status.textAPI.configured ? '✅' : '❌'}</div>
        <div class="status-info">
          <strong>Text AI</strong>
          <small>${status.textAPI.configured ? status.textAPI.model : 'Not configured'}</small>
        </div>
      </div>
      
      <div class="status-item ${status.visionAPI.configured ? 'configured' : 'not-configured'}">
        <div class="status-icon">${status.visionAPI.configured ? '✅' : '❌'}</div>
        <div class="status-info">
          <strong>Vision AI</strong>
          <small>${status.visionAPI.configured ? status.visionAPI.model : 'Not configured'}</small>
        </div>
      </div>
      
      <div class="status-item ${status.speechAPI.configured ? 'configured' : 'not-configured'}">
        <div class="status-icon">${status.speechAPI.configured ? '✅' : '❌'}</div>
        <div class="status-info">
          <strong>Speech AI</strong>
          <small>${status.speechAPI.configured ? status.speechAPI.model : 'Not configured'}</small>
        </div>
      </div>
      
      <div class="status-item ${status.fallbackEnabled ? 'enabled' : 'disabled'}">
        <div class="status-icon">${status.fallbackEnabled ? '🎭' : '🚫'}</div>
        <div class="status-info">
          <strong>Demo Fallback</strong>
          <small>${status.fallbackEnabled ? 'Enabled' : 'Disabled'}</small>
        </div>
      </div>
    `;
  }

  saveOpenAIConfig() {
    const apiKey = document.getElementById('openai-key').value.trim();
    if (!apiKey) {
      alert('Please enter your OpenAI API key');
      return;
    }
    
    window.configLoader.setOpenAIConfig(apiKey);
    this.closeConfigModal();
    this.showConfigSuccessMessage('OpenAI');
  }

  saveAnthropicConfig() {
    const apiKey = document.getElementById('anthropic-key').value.trim();
    if (!apiKey) {
      alert('Please enter your Anthropic API key');
      return;
    }
    
    window.configLoader.setAnthropicConfig(apiKey);
    this.closeConfigModal();
    this.showConfigSuccessMessage('Anthropic');
  }

  saveGoogleConfig() {
    const apiKey = document.getElementById('google-key').value.trim();
    if (!apiKey) {
      alert('Please enter your Google API key');
      return;
    }
    
    window.configLoader.setGoogleConfig(apiKey);
    this.closeConfigModal();
    this.showConfigSuccessMessage('Google');
  }

  saveLocalConfig() {
    const url = document.getElementById('local-url').value.trim();
    const model = document.getElementById('local-model').value.trim();
    
    if (!url || !model) {
      alert('Please enter both URL and model name');
      return;
    }
    
    window.configLoader.setLocalConfig(url, model);
    this.closeConfigModal();
    this.showConfigSuccessMessage('Local LLM');
  }

  saveCustomConfig() {
    const url = document.getElementById('custom-url').value.trim();
    const apiKey = document.getElementById('custom-key').value.trim();
    const model = document.getElementById('custom-model').value.trim();
    
    if (!url || !apiKey || !model) {
      alert('Please fill in all fields');
      return;
    }
    
    window.configLoader.updateConfig({
      OPENAI_API_URL: url,
      OPENAI_API_KEY: apiKey,
      OPENAI_MODEL_ID: model
    });
    
    this.closeConfigModal();
    this.showConfigSuccessMessage('Custom API');
  }

  enableDemoMode() {
    window.configLoader.updateConfig({
      FALLBACK_TO_MOCK: 'true'
    });
    
    this.closeConfigModal();
    this.addMessage('bot', '🎭 Demo mode enabled! Using mock responses for demonstration.', 'system');
  }

  closeConfigModal() {
    const modal = document.querySelector('.api-config-modal');
    if (modal) {
      modal.remove();
    }
  }

  showConfigSuccessMessage(provider) {
    this.addMessage('bot', `🚀 ${provider} API configured successfully! You'll now get real AI-powered responses.`, 'system');
    
    // Trigger configuration update
    window.dispatchEvent(new CustomEvent('configUpdated', { 
      detail: window.configLoader.getAPIStatus() 
    }));
  }
}

// Initialize the Chat SDK when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.shoprChat = new ShoprChatSDK({
    apiKey: 'demo-key',
    position: 'bottom-right',
    primaryColor: '#ff6b6b',
    secondaryColor: '#4ecdc4'
  });
});