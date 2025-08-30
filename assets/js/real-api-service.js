/**
 * Real API Service for Shopr Chat SDK
 * Integrates with OpenAI-compatible APIs for real AI-powered responses
 */

class RealAPIService {
  constructor() {
    this.config = this.loadConfig();
    this.productDatabase = this.initializeProductDatabase();
    this.requestCount = 0;
    this.lastRequestTime = Date.now();
    this.rateLimitWindow = new Map();
    
    // Initialize rate limiting
    this.initRateLimit();
  }

  loadConfig() {
    // Load configuration from window.ENV (set by config.js)
    const config = {
      apiUrl: window.ENV?.OPENAI_API_URL || 'https://api.openai.com/v1',
      apiKey: window.ENV?.OPENAI_API_KEY || 'your-api-key-here',
      modelId: window.ENV?.OPENAI_MODEL_ID || 'gpt-4o-mini',
      visionApiUrl: window.ENV?.VISION_API_URL || 'https://api.openai.com/v1',
      visionApiKey: window.ENV?.VISION_API_KEY || 'your-api-key-here',
      visionModelId: window.ENV?.VISION_MODEL_ID || 'gpt-4-vision-preview',
      speechApiUrl: window.ENV?.SPEECH_API_URL || 'https://api.openai.com/v1',
      speechApiKey: window.ENV?.SPEECH_API_KEY || 'your-api-key-here',
      speechModelId: window.ENV?.SPEECH_MODEL_ID || 'whisper-1',
      maxTokens: parseInt(window.ENV?.MAX_TOKENS) || 1000,
      temperature: parseFloat(window.ENV?.TEMPERATURE) || 0.7,
      topP: parseFloat(window.ENV?.TOP_P) || 0.9,
      requestsPerMinute: parseInt(window.ENV?.REQUESTS_PER_MINUTE) || 60,
      requestsPerHour: parseInt(window.ENV?.REQUESTS_PER_HOUR) || 1000,
      debugMode: window.ENV?.DEBUG_MODE === 'true',
      fallbackToMock: window.ENV?.FALLBACK_TO_MOCK === 'true'
    };

    // Log configuration status
    console.log('🔧 Real API Service Configuration:');
    console.log('  • API URL:', config.apiUrl);
    console.log('  • Model:', config.modelId);
    console.log('  • API Key:', config.apiKey ? '[CONFIGURED]' : '[NOT SET]');
    console.log('  • Fallback to Mock:', config.fallbackToMock);
    console.log('  • Debug Mode:', config.debugMode);

    return config;
  }

  initRateLimit() {
    // Clean up rate limit tracking every minute
    setInterval(() => {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      const oneHourAgo = now - 3600000;
      
      // Clean up old entries
      for (const [timestamp] of this.rateLimitWindow) {
        if (timestamp < oneHourAgo) {
          this.rateLimitWindow.delete(timestamp);
        }
      }
    }, 60000);
  }

  async checkRateLimit() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;
    
    // Count requests in the last minute and hour
    let requestsLastMinute = 0;
    let requestsLastHour = 0;
    
    for (const [timestamp] of this.rateLimitWindow) {
      if (timestamp > oneMinuteAgo) requestsLastMinute++;
      if (timestamp > oneHourAgo) requestsLastHour++;
    }
    
    if (requestsLastMinute >= this.config.requestsPerMinute) {
      throw new Error('Rate limit exceeded: too many requests per minute');
    }
    
    if (requestsLastHour >= this.config.requestsPerHour) {
      throw new Error('Rate limit exceeded: too many requests per hour');
    }
    
    // Record this request
    this.rateLimitWindow.set(now, true);
  }

  initializeProductDatabase() {
    // Use the same product database as MockAPIService for consistency
    if (window.MockAPIService) {
      const mockService = new window.MockAPIService();
      return mockService.products;
    }
    
    // Fallback minimal product database
    return [
      {
        id: 1,
        name: "Men's Winter Jacket",
        category: "jackets",
        price: 4999,
        image: "./assets/images/products/jacket-1.jpg",
        rating: 4.5,
        tags: ["winter", "warm", "outdoor", "men"],
        description: "Premium winter jacket with thermal insulation"
      }
    ];
  }

  async makeAPIRequest(endpoint, payload, apiKey = null) {
    try {
      await this.checkRateLimit();
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey || this.config.apiKey}`
      };
      
      if (this.config.debugMode) {
        console.log('🚀 Making API Request:', { 
          endpoint, 
          model: payload.model,
          messages: payload.messages?.length + ' messages',
          headers: { ...headers, Authorization: '[REDACTED]' } 
        });
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: { message: errorText || response.statusText } };
        }
        
        console.error('❌ API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        throw new Error(`API Error ${response.status}: ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      if (this.config.debugMode) {
        console.log('✅ API Response received:', {
          model: data.model || 'unknown',
          usage: data.usage,
          choices: data.choices?.length + ' choices'
        });
      }
      
      // Validate response structure
      if (!data.choices || data.choices.length === 0) {
        throw new Error('Invalid API response: No choices returned');
      }
      
      return data;
    } catch (error) {
      console.error('💥 API Request failed:', error.message);
      
      // Only fallback to mock if the setting is enabled
      if (this.config.fallbackToMock && window.MockAPIService) {
        console.log('🎭 Falling back to mock API service');
        throw new Error('FALLBACK_TO_MOCK');
      }
      
      throw error;
    }
  }

  async processTextQuery(query, userId = null) {
    try {
      const systemPrompt = this.createSystemPrompt();
      const userPrompt = this.createUserPrompt(query, userId);
      
      const payload = {
        model: this.config.modelId,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        top_p: this.config.topP
      };
      
      const response = await this.makeAPIRequest(
        `${this.config.apiUrl}/chat/completions`,
        payload
      );
      
      const aiResponse = response.choices[0].message.content;
      const parsedResponse = this.parseAIResponse(aiResponse, query);
      
      return {
        message: parsedResponse.message,
        products: this.findRelevantProducts(parsedResponse.keywords, query),
        intent: parsedResponse.intent,
        keywords: parsedResponse.keywords,
        aiGenerated: true
      };
      
    } catch (error) {
      if (error.message === 'FALLBACK_TO_MOCK') {
        const mockService = new window.MockAPIService();
        return await mockService.processTextQuery(query, userId);
      }
      throw error;
    }
  }

  async processImageQuery(imageFile, userId = null) {
    try {
      const base64Image = await this.convertImageToBase64(imageFile);
      
      const payload = {
        model: this.config.visionModelId,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this fashion/product image and describe what you see. Focus on: 1) Product type and category 2) Colors and patterns 3) Style and design elements 4) Suitable occasions 5) Fashion trends. Provide a detailed analysis for product matching."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: this.config.maxTokens,
        temperature: 0.3 // Lower temperature for more consistent image analysis
      };
      
      const response = await this.makeAPIRequest(
        `${this.config.visionApiUrl}/chat/completions`,
        payload,
        this.config.visionApiKey
      );
      
      const analysis = response.choices[0].message.content;
      const parsedAnalysis = this.parseImageAnalysis(analysis);
      
      return {
        message: `I analyzed your image and found: ${parsedAnalysis.detectedItems.join(', ')}. Here are similar products:`,
        products: this.findSimilarProducts(parsedAnalysis),
        analysis: parsedAnalysis,
        confidence: parsedAnalysis.confidence,
        aiGenerated: true
      };
      
    } catch (error) {
      if (error.message === 'FALLBACK_TO_MOCK') {
        const mockService = new window.MockAPIService();
        return await mockService.processImageQuery(imageFile, userId);
      }
      throw error;
    }
  }

  async processVoiceQuery(transcript, language = 'en', userId = null) {
    try {
      // For voice queries, we use the same text processing but with language context
      const contextualQuery = this.addLanguageContext(transcript, language);
      const result = await this.processTextQuery(contextualQuery, userId);
      
      return {
        ...result,
        originalTranscript: transcript,
        language,
        voiceProcessed: true
      };
      
    } catch (error) {
      if (error.message === 'FALLBACK_TO_MOCK') {
        const mockService = new window.MockAPIService();
        return await mockService.processVoiceQuery(transcript, language, userId);
      }
      throw error;
    }
  }

  createSystemPrompt() {
    return `You are Aria, an enthusiastic and knowledgeable AI shopping assistant for Shopr, a fashion and lifestyle eCommerce platform. 

Your personality:
- Enthusiastic and friendly
- Fashion-forward and trendy
- Helpful and knowledgeable
- Uses emojis appropriately
- Provides personalized recommendations

Your capabilities:
- Help users find products based on their descriptions
- Provide fashion advice and styling tips
- Understand seasonal and occasion-based needs
- Offer personalized recommendations
- Explain product features and benefits

Response format:
Always respond with a JSON object containing:
{
  "message": "Your enthusiastic response to the user",
  "intent": "search|recommend|browse|compare|help",
  "keywords": ["extracted", "keywords", "from", "query"],
  "category": "detected product category",
  "occasion": "detected occasion if any",
  "style": "detected style preference",
  "insights": ["fashion", "insights", "and", "tips"]
}

Keep responses engaging, helpful, and focused on fashion and shopping.`;
  }

  createUserPrompt(query, userId) {
    const userContext = userId ? this.getUserContext(userId) : '';
    
    return `User query: "${query}"

${userContext}

Please analyze this query and provide an enthusiastic, helpful response as Aria, the shopping assistant. Focus on understanding what the user is looking for and provide relevant fashion advice.`;
  }

  getUserContext(userId) {
    // Get user context from local storage or user profile
    const userProfile = JSON.parse(localStorage.getItem('shopr_user_profile') || '{}');
    
    if (userProfile.searchHistory && userProfile.searchHistory.length > 0) {
      const recentSearches = userProfile.searchHistory.slice(-3).map(s => s.query).join(', ');
      return `User's recent searches: ${recentSearches}`;
    }
    
    return '';
  }

  parseAIResponse(aiResponse, originalQuery) {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(aiResponse);
      return {
        message: parsed.message || aiResponse,
        intent: parsed.intent || 'search',
        keywords: parsed.keywords || this.extractKeywords(originalQuery),
        category: parsed.category,
        occasion: parsed.occasion,
        style: parsed.style,
        insights: parsed.insights || []
      };
    } catch (error) {
      // Fallback to text parsing if JSON parsing fails
      return {
        message: aiResponse,
        intent: 'search',
        keywords: this.extractKeywords(originalQuery),
        category: null,
        occasion: null,
        style: null,
        insights: []
      };
    }
  }

  parseImageAnalysis(analysis) {
    // Extract key information from the AI's image analysis
    const lowerAnalysis = analysis.toLowerCase();
    
    const detectedItems = [];
    const colors = [];
    const styles = [];
    
    // Product type detection
    const productTypes = ['jacket', 'shirt', 'dress', 'shoes', 'watch', 'bag', 'jewelry', 'pants', 'skirt'];
    productTypes.forEach(type => {
      if (lowerAnalysis.includes(type)) {
        detectedItems.push(type);
      }
    });
    
    // Color detection
    const colorWords = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'brown', 'gray', 'navy', 'beige'];
    colorWords.forEach(color => {
      if (lowerAnalysis.includes(color)) {
        colors.push(color);
      }
    });
    
    // Style detection
    const styleWords = ['casual', 'formal', 'elegant', 'sporty', 'vintage', 'modern', 'classic', 'trendy'];
    styleWords.forEach(style => {
      if (lowerAnalysis.includes(style)) {
        styles.push(style);
      }
    });
    
    return {
      detectedItems: detectedItems.length > 0 ? detectedItems : ['clothing'],
      dominantColors: colors,
      style: styles[0] || 'casual',
      confidence: 0.85 + Math.random() * 0.1, // Simulated confidence score
      fullAnalysis: analysis
    };
  }

  addLanguageContext(transcript, language) {
    const languageContext = {
      'hi': 'Hindi query: ',
      'ar': 'Arabic query: ',
      'en': ''
    };
    
    return (languageContext[language] || '') + transcript;
  }

  extractKeywords(query) {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'show', 'me', 'find', 'get', 'want', 'need', 'looking', 'search'];
    return query.toLowerCase()
      .split(' ')
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .map(word => word.replace(/[^\w]/g, ''));
  }

  findRelevantProducts(keywords, originalQuery) {
    const lowerQuery = originalQuery.toLowerCase();
    
    // Search products based on keywords and query
    const relevantProducts = this.productDatabase.filter(product => {
      const searchText = `${product.name} ${product.category} ${product.tags?.join(' ') || ''} ${product.description || ''}`.toLowerCase();
      
      // Check if any keyword matches
      const keywordMatch = keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
      
      // Check if original query matches
      const queryMatch = searchText.includes(lowerQuery) || 
                         product.category.includes(lowerQuery) ||
                         (product.tags && product.tags.some(tag => lowerQuery.includes(tag)));
      
      return keywordMatch || queryMatch;
    });
    
    // Sort by relevance (you could implement more sophisticated scoring)
    return relevantProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);
  }

  findSimilarProducts(analysis) {
    const { detectedItems, dominantColors, style } = analysis;
    
    return this.productDatabase.filter(product => {
      const productText = `${product.name} ${product.category} ${product.tags?.join(' ') || ''}`.toLowerCase();
      
      // Check for item type match
      const itemMatch = detectedItems.some(item => 
        productText.includes(item) || 
        product.category.includes(item)
      );
      
      // Check for style match
      const styleMatch = product.tags?.includes(style) || 
                        product.category.includes(style) ||
                        productText.includes(style);
      
      return itemMatch || styleMatch;
    }).slice(0, 4);
  }

  async convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Utility methods for compatibility with existing code
  getTrendingProducts() {
    return this.productDatabase.filter(product => product.trending || product.rating > 4.5).slice(0, 6);
  }

  getBestDeals() {
    return this.productDatabase.filter(product => product.originalPrice || product.bestDeal).slice(0, 6);
  }

  getProductsByCategory(category) {
    return this.productDatabase.filter(product => product.category === category).slice(0, 6);
  }

  trackQuery(userId, query, type, results) {
    // Track queries for analytics (implement as needed)
    if (this.config.debugMode) {
      console.log('Query tracked:', { userId, query, type, resultsCount: results.length });
    }
  }

  trackProductClick(userId, productId) {
    // Track product clicks for analytics (implement as needed)
    if (this.config.debugMode) {
      console.log('Product click tracked:', { userId, productId });
    }
  }
}

// Export for use in chat SDK
window.RealAPIService = RealAPIService;