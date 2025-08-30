/**
 * Mock API Service for Shopr Chat SDK
 * Simulates backend AI services for NLP, Image Recognition, and Voice Processing
 */

class MockAPIService {
  constructor() {
    this.products = this.initializeProductDatabase();
    this.userProfiles = new Map();
  }

  initializeProductDatabase() {
    return [
      // Jackets & Coats
      {
        id: 1,
        name: "Men's Winter Jacket",
        category: "jackets",
        subcategory: "winter",
        price: 4999,
        originalPrice: 6999,
        image: "./assets/images/products/jacket-1.jpg",
        rating: 4.5,
        reviews: 128,
        tags: ["winter", "warm", "outdoor", "men"],
        description: "Premium winter jacket with thermal insulation",
        inStock: true,
        trending: true
      },
      {
        id: 2,
        name: "Casual Denim Jacket",
        category: "jackets",
        subcategory: "casual",
        price: 2999,
        image: "./assets/images/products/jacket-2.jpg",
        rating: 4.2,
        reviews: 89,
        tags: ["denim", "casual", "everyday", "unisex"],
        description: "Classic denim jacket for casual wear",
        inStock: true
      },
      {
        id: 3,
        name: "Formal Blazer",
        category: "jackets",
        subcategory: "formal",
        price: 5999,
        image: "./assets/images/products/jacket-3.jpg",
        rating: 4.7,
        reviews: 156,
        tags: ["formal", "business", "professional", "blazer"],
        description: "Elegant blazer for business occasions",
        inStock: true
      },
      {
        id: 4,
        name: "Sports Jacket",
        category: "jackets",
        subcategory: "sports",
        price: 3499,
        image: "./assets/images/products/jacket-4.jpg",
        rating: 4.3,
        reviews: 67,
        tags: ["sports", "athletic", "fitness", "lightweight"],
        description: "Lightweight sports jacket for active lifestyle",
        inStock: true,
        trending: true
      },
      {
        id: 5,
        name: "Leather Jacket",
        category: "jackets",
        subcategory: "leather",
        price: 8999,
        originalPrice: 11999,
        image: "./assets/images/products/jacket-5.jpg",
        rating: 4.8,
        reviews: 203,
        tags: ["leather", "premium", "style", "biker"],
        description: "Premium leather jacket with classic design",
        inStock: true,
        bestDeal: true
      },
      {
        id: 6,
        name: "Windbreaker",
        category: "jackets",
        subcategory: "windbreaker",
        price: 2499,
        image: "./assets/images/products/jacket-6.jpg",
        rating: 4.1,
        reviews: 45,
        tags: ["windbreaker", "light", "rain", "outdoor"],
        description: "Lightweight windbreaker for outdoor activities",
        inStock: true
      },

      // Shoes
      {
        id: 7,
        name: "Running Shoes",
        category: "shoes",
        subcategory: "sports",
        price: 3999,
        originalPrice: 5999,
        image: "./assets/images/products/shoe-1.jpg",
        rating: 4.6,
        reviews: 234,
        tags: ["running", "sports", "comfortable", "breathable"],
        description: "High-performance running shoes with advanced cushioning",
        inStock: true,
        bestDeal: true
      },
      {
        id: 8,
        name: "Casual Sneakers",
        category: "shoes",
        subcategory: "casual",
        price: 2499,
        image: "./assets/images/products/shoe-2.jpg",
        rating: 4.3,
        reviews: 167,
        tags: ["sneakers", "casual", "everyday", "comfortable"],
        description: "Stylish casual sneakers for daily wear",
        inStock: true
      },
      {
        id: 9,
        name: "Formal Shoes",
        category: "shoes",
        subcategory: "formal",
        price: 4499,
        image: "./assets/images/products/shoe-3.jpg",
        rating: 4.4,
        reviews: 98,
        tags: ["formal", "business", "leather", "professional"],
        description: "Classic formal shoes for business occasions",
        inStock: true,
        trending: true
      },
      {
        id: 10,
        name: "High-top Sneakers",
        category: "shoes",
        subcategory: "sneakers",
        price: 3299,
        image: "./assets/images/products/shoe-4.jpg",
        rating: 4.2,
        reviews: 134,
        tags: ["high-top", "sneakers", "street", "style"],
        description: "Trendy high-top sneakers with street style",
        inStock: true
      },
      {
        id: 11,
        name: "Sports Sandals",
        category: "shoes",
        subcategory: "sandals",
        price: 1999,
        image: "./assets/images/products/shoe-5.jpg",
        rating: 4.0,
        reviews: 76,
        tags: ["sandals", "summer", "comfortable", "outdoor"],
        description: "Comfortable sports sandals for summer",
        inStock: true
      },

      // Watches
      {
        id: 12,
        name: "Smart Watch Pro",
        category: "watches",
        subcategory: "smart",
        price: 12999,
        originalPrice: 15999,
        image: "./assets/images/products/watch-1.jpg",
        rating: 4.8,
        reviews: 456,
        tags: ["smart", "fitness", "technology", "premium"],
        description: "Advanced smartwatch with health monitoring",
        inStock: true,
        trending: true
      },
      {
        id: 13,
        name: "Classic Analog Watch",
        category: "watches",
        subcategory: "analog",
        price: 8999,
        image: "./assets/images/products/watch-2.jpg",
        rating: 4.4,
        reviews: 189,
        tags: ["analog", "classic", "elegant", "timeless"],
        description: "Elegant analog watch with classic design",
        inStock: true
      },
      {
        id: 14,
        name: "Digital Sports Watch",
        category: "watches",
        subcategory: "sports",
        price: 3999,
        image: "./assets/images/products/watch-3.jpg",
        rating: 4.3,
        reviews: 123,
        tags: ["digital", "sports", "durable", "waterproof"],
        description: "Durable digital watch for sports activities",
        inStock: true,
        bestDeal: true
      },
      {
        id: 15,
        name: "Luxury Watch",
        category: "watches",
        subcategory: "luxury",
        price: 25999,
        image: "./assets/images/products/watch-4.jpg",
        rating: 4.9,
        reviews: 67,
        tags: ["luxury", "premium", "gold", "exclusive"],
        description: "Exclusive luxury watch with gold finish",
        inStock: true
      },

      // Clothing
      {
        id: 16,
        name: "Cotton T-Shirt",
        category: "clothing",
        subcategory: "tshirts",
        price: 999,
        image: "./assets/images/products/clothes-1.jpg",
        rating: 4.2,
        reviews: 234,
        tags: ["cotton", "comfortable", "casual", "basic"],
        description: "Comfortable cotton t-shirt for everyday wear",
        inStock: true
      },
      {
        id: 17,
        name: "Formal Shirt",
        category: "clothing",
        subcategory: "shirts",
        price: 1999,
        image: "./assets/images/products/clothes-2.jpg",
        rating: 4.5,
        reviews: 156,
        tags: ["formal", "business", "professional", "cotton"],
        description: "Professional formal shirt for business wear",
        inStock: true
      },
      {
        id: 18,
        name: "Casual Jeans",
        category: "clothing",
        subcategory: "jeans",
        price: 2499,
        image: "./assets/images/products/clothes-3.jpg",
        rating: 4.3,
        reviews: 189,
        tags: ["jeans", "casual", "denim", "comfortable"],
        description: "Comfortable casual jeans with modern fit",
        inStock: true,
        trending: true
      },
      {
        id: 19,
        name: "Summer Dress",
        category: "clothing",
        subcategory: "dresses",
        price: 3499,
        image: "./assets/images/products/clothes-4.jpg",
        rating: 4.6,
        reviews: 98,
        tags: ["dress", "summer", "elegant", "women"],
        description: "Elegant summer dress for special occasions",
        inStock: true
      },

      // Accessories
      {
        id: 20,
        name: "Leather Belt",
        category: "accessories",
        subcategory: "belts",
        price: 1499,
        image: "./assets/images/products/belt.jpg",
        rating: 4.4,
        reviews: 123,
        tags: ["belt", "leather", "accessory", "formal"],
        description: "Premium leather belt for formal wear",
        inStock: true
      },

      // Beauty & Personal Care
      {
        id: 21,
        name: "Premium Perfume",
        category: "beauty",
        subcategory: "perfume",
        price: 4999,
        image: "./assets/images/products/perfume.jpg",
        rating: 4.7,
        reviews: 234,
        tags: ["perfume", "fragrance", "luxury", "unisex"],
        description: "Luxury perfume with long-lasting fragrance",
        inStock: true
      },
      {
        id: 22,
        name: "Hair Shampoo",
        category: "beauty",
        subcategory: "haircare",
        price: 899,
        image: "./assets/images/products/shampoo.jpg",
        rating: 4.3,
        reviews: 167,
        tags: ["shampoo", "haircare", "natural", "organic"],
        description: "Natural organic shampoo for healthy hair",
        inStock: true
      },

      // Jewelry
      {
        id: 23,
        name: "Gold Earrings",
        category: "jewelry",
        subcategory: "earrings",
        price: 8999,
        image: "./assets/images/products/jewellery-1.jpg",
        rating: 4.8,
        reviews: 89,
        tags: ["earrings", "gold", "jewelry", "elegant"],
        description: "Elegant gold earrings for special occasions",
        inStock: true
      },
      {
        id: 24,
        name: "Silver Necklace",
        category: "jewelry",
        subcategory: "necklaces",
        price: 5999,
        image: "./assets/images/products/jewellery-2.jpg",
        rating: 4.6,
        reviews: 134,
        tags: ["necklace", "silver", "jewelry", "classic"],
        description: "Classic silver necklace with modern design",
        inStock: true
      }
    ];
  }

  // Natural Language Processing for text queries
  async processTextQuery(query, userId = null) {
    await this.simulateDelay(800, 1500);
    
    const lowerQuery = query.toLowerCase();
    const keywords = this.extractKeywords(lowerQuery);
    const intent = this.detectIntent(lowerQuery);
    
    let products = [];
    let responseMessage = "";

    switch (intent) {
      case 'search_product':
        products = this.searchProducts(keywords);
        responseMessage = `Found ${products.length} products matching "${query}":`;
        break;
        
      case 'trending':
        products = this.getTrendingProducts();
        responseMessage = "🔥 Here are the trending products right now:";
        break;
        
      case 'deals':
        products = this.getBestDeals();
        responseMessage = "💰 Here are the best deals available:";
        break;
        
      case 'recommendations':
        products = await this.getPersonalizedRecommendations(userId);
        responseMessage = "👤 Based on your preferences, I recommend:";
        break;
        
      case 'new_arrivals':
        products = this.getNewArrivals();
        responseMessage = "✨ Check out our latest arrivals:";
        break;
        
      case 'category':
        const category = this.detectCategory(keywords);
        products = this.getProductsByCategory(category);
        responseMessage = `Here are products in ${category}:`;
        break;
        
      default:
        products = this.getGeneralRecommendations(keywords);
        responseMessage = `Here are some products related to "${query}":`;
    }

    return {
      message: responseMessage,
      products: products.slice(0, 6), // Limit to 6 products
      intent,
      keywords
    };
  }

  // Image Recognition Processing
  async processImageQuery(imageFile, userId = null) {
    await this.simulateDelay(1500, 3000);
    
    // Mock image analysis - in real implementation, this would use AI models
    const mockAnalysis = this.mockImageAnalysis(imageFile);
    const similarProducts = this.findSimilarProducts(mockAnalysis);
    
    return {
      message: `I analyzed your image and found it contains: ${mockAnalysis.detectedItems.join(', ')}. Here are similar products:`,
      products: similarProducts.slice(0, 4),
      analysis: mockAnalysis,
      confidence: mockAnalysis.confidence
    };
  }

  // Voice Processing
  async processVoiceQuery(transcript, language = 'en', userId = null) {
    await this.simulateDelay(500, 1000);
    
    // Process the voice transcript as text
    const result = await this.processTextQuery(transcript, userId);
    
    return {
      ...result,
      originalTranscript: transcript,
      language,
      voiceProcessed: true
    };
  }

  // Helper Methods
  extractKeywords(query) {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'show', 'me', 'find', 'get', 'want', 'need', 'looking', 'search'];
    return query.split(' ')
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .map(word => word.replace(/[^\w]/g, ''));
  }

  detectIntent(query) {
    if (query.includes('trending') || query.includes('popular') || query.includes('hot')) {
      return 'trending';
    }
    if (query.includes('deal') || query.includes('discount') || query.includes('offer') || query.includes('sale')) {
      return 'deals';
    }
    if (query.includes('recommend') || query.includes('for me') || query.includes('suggest')) {
      return 'recommendations';
    }
    if (query.includes('new') || query.includes('latest') || query.includes('arrival')) {
      return 'new_arrivals';
    }
    if (this.detectCategory(query)) {
      return 'category';
    }
    return 'search_product';
  }

  detectCategory(keywords) {
    const categoryKeywords = {
      'jackets': ['jacket', 'coat', 'blazer', 'windbreaker'],
      'shoes': ['shoe', 'sneaker', 'boot', 'sandal', 'footwear'],
      'watches': ['watch', 'timepiece', 'smartwatch'],
      'clothing': ['shirt', 'tshirt', 'jeans', 'dress', 'clothes', 'apparel'],
      'accessories': ['belt', 'bag', 'accessory'],
      'beauty': ['perfume', 'shampoo', 'cosmetic', 'beauty'],
      'jewelry': ['jewelry', 'earring', 'necklace', 'ring']
    };

    const queryStr = Array.isArray(keywords) ? keywords.join(' ') : keywords;
    
    for (const [category, words] of Object.entries(categoryKeywords)) {
      if (words.some(word => queryStr.includes(word))) {
        return category;
      }
    }
    return null;
  }

  searchProducts(keywords) {
    return this.products.filter(product => {
      const searchText = `${product.name} ${product.category} ${product.subcategory} ${product.tags.join(' ')} ${product.description}`.toLowerCase();
      return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
    }).sort((a, b) => b.rating - a.rating);
  }

  getTrendingProducts() {
    return this.products.filter(product => product.trending).sort((a, b) => b.rating - a.rating);
  }

  getBestDeals() {
    return this.products.filter(product => product.bestDeal || product.originalPrice).sort((a, b) => {
      const discountA = product.originalPrice ? ((product.originalPrice - product.price) / product.originalPrice) : 0;
      const discountB = product.originalPrice ? ((product.originalPrice - product.price) / product.originalPrice) : 0;
      return discountB - discountA;
    });
  }

  getNewArrivals() {
    // Mock new arrivals - in real implementation, this would be based on creation date
    return this.products.slice(0, 8).sort((a, b) => b.id - a.id);
  }

  getProductsByCategory(category) {
    if (!category) return [];
    return this.products.filter(product => product.category === category).sort((a, b) => b.rating - a.rating);
  }

  async getPersonalizedRecommendations(userId) {
    if (!userId) return this.getTrendingProducts();
    
    // Mock personalized recommendations based on user history
    // In real implementation, this would use collaborative filtering and user behavior analysis
    const userProfile = this.getUserProfile(userId);
    
    if (userProfile.preferences && Object.keys(userProfile.preferences).length > 0) {
      const preferredCategories = Object.keys(userProfile.preferences);
      return this.products.filter(product => 
        preferredCategories.includes(product.category)
      ).sort((a, b) => b.rating - a.rating);
    }
    
    return this.getTrendingProducts();
  }

  getGeneralRecommendations(keywords) {
    if (keywords.length === 0) return this.getTrendingProducts();
    
    const searchResults = this.searchProducts(keywords);
    if (searchResults.length > 0) return searchResults;
    
    return this.products.slice(0, 6).sort((a, b) => b.rating - a.rating);
  }

  mockImageAnalysis(imageFile) {
    // Mock image analysis results
    const mockResults = [
      {
        detectedItems: ['jacket', 'clothing'],
        dominantColors: ['blue', 'dark'],
        style: 'casual',
        confidence: 0.92
      },
      {
        detectedItems: ['shoes', 'sneakers'],
        dominantColors: ['white', 'black'],
        style: 'sporty',
        confidence: 0.88
      },
      {
        detectedItems: ['watch', 'accessory'],
        dominantColors: ['silver', 'black'],
        style: 'modern',
        confidence: 0.95
      }
    ];
    
    return mockResults[Math.floor(Math.random() * mockResults.length)];
  }

  findSimilarProducts(analysis) {
    const { detectedItems, style } = analysis;
    
    return this.products.filter(product => {
      const itemMatch = detectedItems.some(item => 
        product.category.includes(item) || 
        product.tags.some(tag => tag.includes(item))
      );
      
      const styleMatch = product.tags.includes(style) || 
        product.subcategory.includes(style);
      
      return itemMatch || styleMatch;
    }).sort((a, b) => b.rating - a.rating);
  }

  getUserProfile(userId) {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        preferences: {},
        orderHistory: [],
        clickHistory: [],
        searchHistory: []
      });
    }
    return this.userProfiles.get(userId);
  }

  updateUserProfile(userId, data) {
    const profile = this.getUserProfile(userId);
    Object.assign(profile, data);
    this.userProfiles.set(userId, profile);
  }

  async simulateDelay(min = 500, max = 2000) {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Analytics and tracking
  trackQuery(userId, query, type, results) {
    const profile = this.getUserProfile(userId);
    profile.searchHistory.push({
      query,
      type,
      timestamp: new Date().toISOString(),
      resultsCount: results.length
    });
    
    // Update preferences based on search patterns
    if (results.length > 0) {
      const categories = [...new Set(results.map(p => p.category))];
      categories.forEach(category => {
        profile.preferences[category] = (profile.preferences[category] || 0) + 1;
      });
    }
    
    this.updateUserProfile(userId, profile);
  }

  trackProductClick(userId, productId) {
    const profile = this.getUserProfile(userId);
    const product = this.products.find(p => p.id === productId);
    
    if (product) {
      profile.clickHistory.push({
        productId,
        category: product.category,
        timestamp: new Date().toISOString()
      });
      
      // Update category preferences
      profile.preferences[product.category] = (profile.preferences[product.category] || 0) + 2;
      
      this.updateUserProfile(userId, profile);
    }
  }
}

// Export for use in chat SDK
window.MockAPIService = MockAPIService;