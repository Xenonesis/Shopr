/**
 * Advanced Personalization Engine for Shopr Chat SDK
 * Machine learning-powered personalization and recommendation system
 */

class PersonalizationEngine {
  constructor(config = {}) {
    this.config = {
      // User profiling
      userProfiling: {
        enabled: config.userProfiling !== false,
        maxHistoryItems: config.maxHistoryItems || 1000,
        decayFactor: config.decayFactor || 0.95, // Older interactions have less weight
        categoryWeights: config.categoryWeights || {
          'clothing': 1.0,
          'shoes': 0.9,
          'accessories': 0.8,
          'electronics': 0.7,
          'home': 0.6
        }
      },

      // Behavioral analysis
      behaviorAnalysis: {
        enabled: config.behaviorAnalysis !== false,
        sessionTimeout: config.sessionTimeout || 1800000, // 30 minutes
        clickWeights: {
          'view': 1.0,
          'click': 2.0,
          'add_to_cart': 5.0,
          'purchase': 10.0,
          'wishlist': 3.0,
          'share': 2.5
        },
        timeWeights: {
          'recent': 1.0,    // Last 24 hours
          'week': 0.8,      // Last week
          'month': 0.6,     // Last month
          'older': 0.3      // Older than month
        }
      },

      // Recommendation algorithms
      recommendations: {
        collaborativeFiltering: config.collaborativeFiltering !== false,
        contentBasedFiltering: config.contentBasedFiltering !== false,
        hybridWeight: config.hybridWeight || 0.7, // Weight for collaborative vs content-based
        minSimilarUsers: config.minSimilarUsers || 5,
        maxRecommendations: config.maxRecommendations || 20,
        diversityFactor: config.diversityFactor || 0.3 // Balance between relevance and diversity
      },

      // Real-time adaptation
      realTimeAdaptation: {
        enabled: config.realTimeAdaptation !== false,
        adaptationRate: config.adaptationRate || 0.1,
        contextualFactors: {
          timeOfDay: config.timeOfDay !== false,
          dayOfWeek: config.dayOfWeek !== false,
          season: config.season !== false,
          weather: config.weather !== false,
          location: config.location !== false
        }
      },

      // A/B testing
      abTesting: {
        enabled: config.abTesting !== false,
        experiments: config.experiments || {},
        defaultVariant: config.defaultVariant || 'control'
      },

      ...config
    };

    this.userProfiles = new Map();
    this.productCatalog = new Map();
    this.userSimilarities = new Map();
    this.contextualData = {};
    this.experiments = new Map();
    
    this.init();
  }

  async init() {
    await this.loadUserProfiles();
    await this.loadProductCatalog();
    this.setupContextualTracking();
    this.setupABTesting();
    this.startPeriodicUpdates();
    
    console.log('🧠 Personalization Engine initialized');
  }

  // ==================== USER PROFILING ====================

  async loadUserProfiles() {
    try {
      const stored = localStorage.getItem('shopr_user_profiles');
      if (stored) {
        const profiles = JSON.parse(stored);
        for (const [userId, profile] of Object.entries(profiles)) {
          this.userProfiles.set(userId, this.enhanceUserProfile(profile));
        }
      }
    } catch (error) {
      console.error('Failed to load user profiles:', error);
    }
  }

  enhanceUserProfile(profile) {
    return {
      userId: profile.userId,
      demographics: profile.demographics || {},
      preferences: profile.preferences || {},
      behaviorHistory: profile.behaviorHistory || [],
      purchaseHistory: profile.purchaseHistory || [],
      searchHistory: profile.searchHistory || [],
      categoryAffinities: profile.categoryAffinities || {},
      brandAffinities: profile.brandAffinities || {},
      priceRange: profile.priceRange || { min: 0, max: Infinity },
      seasonalPreferences: profile.seasonalPreferences || {},
      styleProfile: profile.styleProfile || {},
      lastUpdated: profile.lastUpdated || Date.now(),
      totalInteractions: profile.totalInteractions || 0,
      conversionRate: profile.conversionRate || 0,
      averageOrderValue: profile.averageOrderValue || 0,
      lifetimeValue: profile.lifetimeValue || 0
    };
  }

  getUserProfile(userId) {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, this.createNewUserProfile(userId));
    }
    return this.userProfiles.get(userId);
  }

  createNewUserProfile(userId) {
    return {
      userId,
      demographics: {},
      preferences: {},
      behaviorHistory: [],
      purchaseHistory: [],
      searchHistory: [],
      categoryAffinities: {},
      brandAffinities: {},
      priceRange: { min: 0, max: Infinity },
      seasonalPreferences: {},
      styleProfile: {},
      lastUpdated: Date.now(),
      totalInteractions: 0,
      conversionRate: 0,
      averageOrderValue: 0,
      lifetimeValue: 0
    };
  }

  updateUserProfile(userId, interaction) {
    const profile = this.getUserProfile(userId);
    const now = Date.now();

    // Add to behavior history
    profile.behaviorHistory.push({
      ...interaction,
      timestamp: now,
      weight: this.calculateInteractionWeight(interaction, now)
    });

    // Limit history size
    if (profile.behaviorHistory.length > this.config.userProfiling.maxHistoryItems) {
      profile.behaviorHistory = profile.behaviorHistory.slice(-this.config.userProfiling.maxHistoryItems);
    }

    // Update category affinities
    if (interaction.category) {
      this.updateCategoryAffinity(profile, interaction.category, interaction.type);
    }

    // Update brand affinities
    if (interaction.brand) {
      this.updateBrandAffinity(profile, interaction.brand, interaction.type);
    }

    // Update price range preferences
    if (interaction.price) {
      this.updatePricePreferences(profile, interaction.price);
    }

    // Update style profile
    if (interaction.style || interaction.tags) {
      this.updateStyleProfile(profile, interaction.style, interaction.tags);
    }

    // Update conversion metrics
    this.updateConversionMetrics(profile, interaction);

    profile.totalInteractions++;
    profile.lastUpdated = now;

    this.saveUserProfiles();
    return profile;
  }

  calculateInteractionWeight(interaction, timestamp) {
    const baseWeight = this.config.behaviorAnalysis.clickWeights[interaction.type] || 1.0;
    const timeWeight = this.calculateTimeWeight(timestamp);
    const contextWeight = this.calculateContextWeight(interaction);
    
    return baseWeight * timeWeight * contextWeight;
  }

  calculateTimeWeight(timestamp) {
    const now = Date.now();
    const age = now - timestamp;
    const dayMs = 24 * 60 * 60 * 1000;

    if (age < dayMs) return this.config.behaviorAnalysis.timeWeights.recent;
    if (age < 7 * dayMs) return this.config.behaviorAnalysis.timeWeights.week;
    if (age < 30 * dayMs) return this.config.behaviorAnalysis.timeWeights.month;
    return this.config.behaviorAnalysis.timeWeights.older;
  }

  calculateContextWeight(interaction) {
    let weight = 1.0;
    
    // Seasonal context
    if (interaction.season && this.getCurrentSeason() === interaction.season) {
      weight *= 1.2;
    }
    
    // Time of day context
    if (interaction.timeOfDay && this.getCurrentTimeOfDay() === interaction.timeOfDay) {
      weight *= 1.1;
    }
    
    return weight;
  }

  updateCategoryAffinity(profile, category, interactionType) {
    if (!profile.categoryAffinities[category]) {
      profile.categoryAffinities[category] = 0;
    }
    
    const weight = this.config.behaviorAnalysis.clickWeights[interactionType] || 1.0;
    const categoryWeight = this.config.userProfiling.categoryWeights[category] || 1.0;
    
    profile.categoryAffinities[category] += weight * categoryWeight;
  }

  updateBrandAffinity(profile, brand, interactionType) {
    if (!profile.brandAffinities[brand]) {
      profile.brandAffinities[brand] = 0;
    }
    
    const weight = this.config.behaviorAnalysis.clickWeights[interactionType] || 1.0;
    profile.brandAffinities[brand] += weight;
  }

  updatePricePreferences(profile, price) {
    if (!profile.priceRange.min || price < profile.priceRange.min) {
      profile.priceRange.min = price;
    }
    if (!profile.priceRange.max || price > profile.priceRange.max) {
      profile.priceRange.max = price;
    }
    
    // Calculate preferred price range (middle 80% of purchases)
    const prices = profile.purchaseHistory.map(p => p.price).filter(p => p).sort((a, b) => a - b);
    if (prices.length >= 5) {
      const p10 = prices[Math.floor(prices.length * 0.1)];
      const p90 = prices[Math.floor(prices.length * 0.9)];
      profile.preferredPriceRange = { min: p10, max: p90 };
    }
  }

  updateStyleProfile(profile, style, tags) {
    if (!profile.styleProfile.styles) profile.styleProfile.styles = {};
    if (!profile.styleProfile.tags) profile.styleProfile.tags = {};
    
    if (style) {
      profile.styleProfile.styles[style] = (profile.styleProfile.styles[style] || 0) + 1;
    }
    
    if (tags && Array.isArray(tags)) {
      tags.forEach(tag => {
        profile.styleProfile.tags[tag] = (profile.styleProfile.tags[tag] || 0) + 1;
      });
    }
  }

  updateConversionMetrics(profile, interaction) {
    if (interaction.type === 'purchase') {
      profile.purchaseHistory.push({
        productId: interaction.productId,
        price: interaction.price,
        category: interaction.category,
        timestamp: Date.now()
      });
      
      // Update conversion rate
      const totalViews = profile.behaviorHistory.filter(h => h.type === 'view').length;
      const totalPurchases = profile.purchaseHistory.length;
      profile.conversionRate = totalViews > 0 ? totalPurchases / totalViews : 0;
      
      // Update average order value
      const totalValue = profile.purchaseHistory.reduce((sum, p) => sum + (p.price || 0), 0);
      profile.averageOrderValue = totalPurchases > 0 ? totalValue / totalPurchases : 0;
      profile.lifetimeValue = totalValue;
    }
  }

  // ==================== COLLABORATIVE FILTERING ====================

  calculateUserSimilarity(userId1, userId2) {
    const profile1 = this.getUserProfile(userId1);
    const profile2 = this.getUserProfile(userId2);
    
    // Calculate similarity based on multiple factors
    const categorySimilarity = this.calculateCategorySimilarity(profile1, profile2);
    const brandSimilarity = this.calculateBrandSimilarity(profile1, profile2);
    const priceSimilarity = this.calculatePriceSimilarity(profile1, profile2);
    const styleSimilarity = this.calculateStyleSimilarity(profile1, profile2);
    
    // Weighted average
    const similarity = (
      categorySimilarity * 0.4 +
      brandSimilarity * 0.3 +
      priceSimilarity * 0.2 +
      styleSimilarity * 0.1
    );
    
    return similarity;
  }

  calculateCategorySimilarity(profile1, profile2) {
    const categories1 = Object.keys(profile1.categoryAffinities);
    const categories2 = Object.keys(profile2.categoryAffinities);
    const allCategories = [...new Set([...categories1, ...categories2])];
    
    if (allCategories.length === 0) return 0;
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    allCategories.forEach(category => {
      const affinity1 = profile1.categoryAffinities[category] || 0;
      const affinity2 = profile2.categoryAffinities[category] || 0;
      
      dotProduct += affinity1 * affinity2;
      norm1 += affinity1 * affinity1;
      norm2 += affinity2 * affinity2;
    });
    
    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  calculateBrandSimilarity(profile1, profile2) {
    const brands1 = new Set(Object.keys(profile1.brandAffinities));
    const brands2 = new Set(Object.keys(profile2.brandAffinities));
    
    const intersection = new Set([...brands1].filter(x => brands2.has(x)));
    const union = new Set([...brands1, ...brands2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  calculatePriceSimilarity(profile1, profile2) {
    const range1 = profile1.preferredPriceRange || profile1.priceRange;
    const range2 = profile2.preferredPriceRange || profile2.priceRange;
    
    if (!range1 || !range2) return 0;
    
    const overlap = Math.max(0, Math.min(range1.max, range2.max) - Math.max(range1.min, range2.min));
    const totalRange = Math.max(range1.max, range2.max) - Math.min(range1.min, range2.min);
    
    return totalRange > 0 ? overlap / totalRange : 0;
  }

  calculateStyleSimilarity(profile1, profile2) {
    const styles1 = profile1.styleProfile.styles || {};
    const styles2 = profile2.styleProfile.styles || {};
    
    const allStyles = [...new Set([...Object.keys(styles1), ...Object.keys(styles2)])];
    if (allStyles.length === 0) return 0;
    
    let similarity = 0;
    allStyles.forEach(style => {
      const count1 = styles1[style] || 0;
      const count2 = styles2[style] || 0;
      similarity += Math.min(count1, count2) / Math.max(count1, count2, 1);
    });
    
    return similarity / allStyles.length;
  }

  findSimilarUsers(userId, limit = 10) {
    const similarities = [];
    
    for (const [otherUserId] of this.userProfiles) {
      if (otherUserId !== userId) {
        const similarity = this.calculateUserSimilarity(userId, otherUserId);
        if (similarity > 0.1) { // Minimum similarity threshold
          similarities.push({ userId: otherUserId, similarity });
        }
      }
    }
    
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // ==================== CONTENT-BASED FILTERING ====================

  calculateProductSimilarity(product1, product2) {
    let similarity = 0;
    let factors = 0;
    
    // Category similarity
    if (product1.category === product2.category) {
      similarity += 0.4;
    }
    factors++;
    
    // Brand similarity
    if (product1.brand === product2.brand) {
      similarity += 0.3;
    }
    factors++;
    
    // Price similarity
    if (product1.price && product2.price) {
      const priceDiff = Math.abs(product1.price - product2.price);
      const avgPrice = (product1.price + product2.price) / 2;
      const priceSimilarity = Math.max(0, 1 - (priceDiff / avgPrice));
      similarity += priceSimilarity * 0.2;
    }
    factors++;
    
    // Tag similarity
    if (product1.tags && product2.tags) {
      const tags1 = new Set(product1.tags);
      const tags2 = new Set(product2.tags);
      const intersection = new Set([...tags1].filter(x => tags2.has(x)));
      const union = new Set([...tags1, ...tags2]);
      const tagSimilarity = union.size > 0 ? intersection.size / union.size : 0;
      similarity += tagSimilarity * 0.1;
    }
    factors++;
    
    return factors > 0 ? similarity / factors : 0;
  }

  getContentBasedRecommendations(userId, products, limit = 10) {
    const profile = this.getUserProfile(userId);
    const recommendations = [];
    
    products.forEach(product => {
      let score = 0;
      
      // Category affinity
      const categoryAffinity = profile.categoryAffinities[product.category] || 0;
      score += categoryAffinity * 0.4;
      
      // Brand affinity
      const brandAffinity = profile.brandAffinities[product.brand] || 0;
      score += brandAffinity * 0.3;
      
      // Price preference
      const priceRange = profile.preferredPriceRange || profile.priceRange;
      if (product.price >= priceRange.min && product.price <= priceRange.max) {
        score += 0.2;
      }
      
      // Style preference
      if (product.tags && profile.styleProfile.tags) {
        const styleScore = product.tags.reduce((sum, tag) => {
          return sum + (profile.styleProfile.tags[tag] || 0);
        }, 0) / product.tags.length;
        score += styleScore * 0.1;
      }
      
      if (score > 0) {
        recommendations.push({ product, score });
      }
    });
    
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.product);
  }

  // ==================== HYBRID RECOMMENDATIONS ====================

  getPersonalizedRecommendations(userId, products, limit = 10) {
    const collaborativeRecs = this.getCollaborativeRecommendations(userId, products, limit * 2);
    const contentBasedRecs = this.getContentBasedRecommendations(userId, products, limit * 2);
    
    // Combine recommendations using hybrid approach
    const hybridWeight = this.config.recommendations.hybridWeight;
    const combinedScores = new Map();
    
    // Add collaborative filtering scores
    collaborativeRecs.forEach((product, index) => {
      const score = (collaborativeRecs.length - index) / collaborativeRecs.length;
      combinedScores.set(product.id, (combinedScores.get(product.id) || 0) + score * hybridWeight);
    });
    
    // Add content-based scores
    contentBasedRecs.forEach((product, index) => {
      const score = (contentBasedRecs.length - index) / contentBasedRecs.length;
      combinedScores.set(product.id, (combinedScores.get(product.id) || 0) + score * (1 - hybridWeight));
    });
    
    // Sort by combined score and apply diversity
    const sortedProducts = Array.from(combinedScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([productId, score]) => {
        const product = products.find(p => p.id === productId);
        return { product, score };
      })
      .filter(item => item.product);
    
    // Apply diversity factor
    const diverseRecommendations = this.applyDiversityFilter(sortedProducts, limit);
    
    return diverseRecommendations.map(item => item.product);
  }

  getCollaborativeRecommendations(userId, products, limit = 10) {
    const similarUsers = this.findSimilarUsers(userId, this.config.recommendations.minSimilarUsers);
    if (similarUsers.length === 0) {
      return this.getContentBasedRecommendations(userId, products, limit);
    }
    
    const productScores = new Map();
    
    similarUsers.forEach(({ userId: similarUserId, similarity }) => {
      const similarProfile = this.getUserProfile(similarUserId);
      
      // Get products this similar user liked
      similarProfile.behaviorHistory.forEach(interaction => {
        if (interaction.type === 'purchase' || interaction.type === 'add_to_cart') {
          const product = products.find(p => p.id === interaction.productId);
          if (product) {
            const score = similarity * interaction.weight;
            productScores.set(product.id, (productScores.get(product.id) || 0) + score);
          }
        }
      });
    });
    
    return Array.from(productScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([productId]) => products.find(p => p.id === productId))
      .filter(product => product);
  }

  applyDiversityFilter(recommendations, limit) {
    if (recommendations.length <= limit) return recommendations;
    
    const diverseRecs = [];
    const usedCategories = new Set();
    const diversityFactor = this.config.recommendations.diversityFactor;
    
    // First, add top recommendations ensuring category diversity
    for (const rec of recommendations) {
      if (diverseRecs.length >= limit) break;
      
      const category = rec.product.category;
      const categoryCount = Array.from(usedCategories).filter(c => c === category).length;
      const maxPerCategory = Math.ceil(limit * diversityFactor);
      
      if (categoryCount < maxPerCategory) {
        diverseRecs.push(rec);
        usedCategories.add(category);
      }
    }
    
    // Fill remaining slots with highest scoring items
    for (const rec of recommendations) {
      if (diverseRecs.length >= limit) break;
      if (!diverseRecs.includes(rec)) {
        diverseRecs.push(rec);
      }
    }
    
    return diverseRecs.slice(0, limit);
  }

  // ==================== CONTEXTUAL ADAPTATION ====================

  setupContextualTracking() {
    if (!this.config.realTimeAdaptation.enabled) return;
    
    // Update contextual data periodically
    setInterval(() => {
      this.updateContextualData();
    }, 60000); // Every minute
    
    this.updateContextualData();
  }

  updateContextualData() {
    const now = new Date();
    
    this.contextualData = {
      timeOfDay: this.getCurrentTimeOfDay(),
      dayOfWeek: now.getDay(),
      season: this.getCurrentSeason(),
      month: now.getMonth(),
      hour: now.getHours(),
      isWeekend: now.getDay() === 0 || now.getDay() === 6,
      timestamp: Date.now()
    };
  }

  getCurrentTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  applyContextualBoost(recommendations, userId) {
    const profile = this.getUserProfile(userId);
    const context = this.contextualData;
    
    return recommendations.map(product => {
      let boost = 1.0;
      
      // Time-based boost
      if (product.tags) {
        if (context.timeOfDay === 'morning' && product.tags.includes('work')) boost *= 1.2;
        if (context.timeOfDay === 'evening' && product.tags.includes('casual')) boost *= 1.2;
        if (context.isWeekend && product.tags.includes('leisure')) boost *= 1.1;
      }
      
      // Seasonal boost
      if (product.season === context.season) boost *= 1.3;
      
      // Category-specific contextual boosts
      if (product.category === 'outerwear' && context.season === 'winter') boost *= 1.4;
      if (product.category === 'swimwear' && context.season === 'summer') boost *= 1.4;
      
      return { ...product, contextualBoost: boost };
    });
  }

  // ==================== A/B TESTING ====================

  setupABTesting() {
    if (!this.config.abTesting.enabled) return;
    
    // Initialize experiments
    for (const [experimentName, experiment] of Object.entries(this.config.abTesting.experiments)) {
      this.experiments.set(experimentName, {
        ...experiment,
        participants: new Map(),
        results: { control: [], variants: {} }
      });
    }
  }

  getExperimentVariant(experimentName, userId) {
    const experiment = this.experiments.get(experimentName);
    if (!experiment) return this.config.abTesting.defaultVariant;
    
    // Check if user is already assigned
    if (experiment.participants.has(userId)) {
      return experiment.participants.get(userId);
    }
    
    // Assign user to variant based on hash
    const hash = this.hashUserId(userId + experimentName);
    const variants = ['control', ...Object.keys(experiment.variants || {})];
    const variantIndex = hash % variants.length;
    const variant = variants[variantIndex];
    
    experiment.participants.set(userId, variant);
    return variant;
  }

  trackExperimentResult(experimentName, userId, metric, value) {
    const experiment = this.experiments.get(experimentName);
    if (!experiment) return;
    
    const variant = experiment.participants.get(userId);
    if (!variant) return;
    
    if (variant === 'control') {
      experiment.results.control.push({ userId, metric, value, timestamp: Date.now() });
    } else {
      if (!experiment.results.variants[variant]) {
        experiment.results.variants[variant] = [];
      }
      experiment.results.variants[variant].push({ userId, metric, value, timestamp: Date.now() });
    }
  }

  hashUserId(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // ==================== PRODUCT CATALOG MANAGEMENT ====================

  async loadProductCatalog() {
    // In a real application, this would load from an API or database
    // For now, we'll use the existing product data
    if (window.MockAPIService) {
      const mockService = new window.MockAPIService();
      const products = mockService.products || [];
      
      products.forEach(product => {
        this.productCatalog.set(product.id, {
          ...product,
          features: this.extractProductFeatures(product),
          popularity: Math.random(), // Simulated popularity score
          trendingScore: Math.random()
        });
      });
    }
  }

  extractProductFeatures(product) {
    return {
      category: product.category,
      brand: product.brand || 'unknown',
      price: product.price,
      priceRange: this.getPriceRange(product.price),
      tags: product.tags || [],
      colors: this.extractColors(product.name, product.description),
      style: this.extractStyle(product.name, product.tags),
      season: this.extractSeason(product.name, product.tags),
      occasion: this.extractOccasion(product.name, product.tags)
    };
  }

  getPriceRange(price) {
    if (price < 1000) return 'budget';
    if (price < 5000) return 'mid-range';
    if (price < 15000) return 'premium';
    return 'luxury';
  }

  extractColors(name, description) {
    const colorWords = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'brown', 'gray', 'navy', 'beige'];
    const text = (name + ' ' + (description || '')).toLowerCase();
    return colorWords.filter(color => text.includes(color));
  }

  extractStyle(name, tags) {
    const styleWords = ['casual', 'formal', 'elegant', 'sporty', 'vintage', 'modern', 'classic', 'trendy'];
    const text = (name + ' ' + (tags || []).join(' ')).toLowerCase();
    return styleWords.find(style => text.includes(style)) || 'casual';
  }

  extractSeason(name, tags) {
    const seasonWords = {
      'winter': ['winter', 'warm', 'coat', 'jacket', 'sweater'],
      'summer': ['summer', 'light', 'shorts', 'tank', 'sandals'],
      'spring': ['spring', 'light', 'cardigan', 'blazer'],
      'fall': ['fall', 'autumn', 'jacket', 'boots']
    };
    
    const text = (name + ' ' + (tags || []).join(' ')).toLowerCase();
    
    for (const [season, words] of Object.entries(seasonWords)) {
      if (words.some(word => text.includes(word))) {
        return season;
      }
    }
    
    return 'all-season';
  }

  extractOccasion(name, tags) {
    const occasionWords = {
      'work': ['work', 'office', 'professional', 'business'],
      'party': ['party', 'evening', 'cocktail', 'formal'],
      'casual': ['casual', 'everyday', 'comfort'],
      'sport': ['sport', 'gym', 'athletic', 'running']
    };
    
    const text = (name + ' ' + (tags || []).join(' ')).toLowerCase();
    
    for (const [occasion, words] of Object.entries(occasionWords)) {
      if (words.some(word => text.includes(word))) {
        return occasion;
      }
    }
    
    return 'general';
  }

  // ==================== PERIODIC UPDATES ====================

  startPeriodicUpdates() {
    // Update user similarities every hour
    setInterval(() => {
      this.updateUserSimilarities();
    }, 3600000);
    
    // Save user profiles every 5 minutes
    setInterval(() => {
      this.saveUserProfiles();
    }, 300000);
    
    // Update trending scores daily
    setInterval(() => {
      this.updateTrendingScores();
    }, 86400000);
  }

  updateUserSimilarities() {
    const userIds = Array.from(this.userProfiles.keys());
    
    for (let i = 0; i < userIds.length; i++) {
      for (let j = i + 1; j < userIds.length; j++) {
        const similarity = this.calculateUserSimilarity(userIds[i], userIds[j]);
        this.userSimilarities.set(`${userIds[i]}-${userIds[j]}`, similarity);
      }
    }
  }

  updateTrendingScores() {
    // Update product trending scores based on recent interactions
    const now = Date.now();
    const recentWindow = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    const productInteractions = new Map();
    
    for (const profile of this.userProfiles.values()) {
      profile.behaviorHistory
        .filter(interaction => now - interaction.timestamp < recentWindow)
        .forEach(interaction => {
          const count = productInteractions.get(interaction.productId) || 0;
          productInteractions.set(interaction.productId, count + interaction.weight);
        });
    }
    
    // Update trending scores
    for (const [productId, product] of this.productCatalog) {
      const interactions = productInteractions.get(productId) || 0;
      product.trendingScore = interactions / Math.max(1, productInteractions.size);
    }
  }

  saveUserProfiles() {
    try {
      const profiles = {};
      for (const [userId, profile] of this.userProfiles) {
        profiles[userId] = profile;
      }
      localStorage.setItem('shopr_user_profiles', JSON.stringify(profiles));
    } catch (error) {
      console.error('Failed to save user profiles:', error);
    }
  }

  // ==================== PUBLIC API ====================

  getRecommendations(userId, options = {}) {
    const {
      limit = 10,
      category = null,
      priceRange = null,
      style = null,
      occasion = null,
      includeContextual = true
    } = options;
    
    let products = Array.from(this.productCatalog.values());
    
    // Apply filters
    if (category) products = products.filter(p => p.category === category);
    if (priceRange) products = products.filter(p => p.features.priceRange === priceRange);
    if (style) products = products.filter(p => p.features.style === style);
    if (occasion) products = products.filter(p => p.features.occasion === occasion);
    
    // Get personalized recommendations
    let recommendations = this.getPersonalizedRecommendations(userId, products, limit);
    
    // Apply contextual boost if enabled
    if (includeContextual && this.config.realTimeAdaptation.enabled) {
      recommendations = this.applyContextualBoost(recommendations, userId);
      recommendations.sort((a, b) => (b.contextualBoost || 1) - (a.contextualBoost || 1));
    }
    
    return recommendations.slice(0, limit);
  }

  trackUserInteraction(userId, interaction) {
    this.updateUserProfile(userId, interaction);
    
    // Track for A/B testing
    if (interaction.experimentName) {
      this.trackExperimentResult(interaction.experimentName, userId, interaction.type, interaction.value || 1);
    }
  }

  getUserInsights(userId) {
    const profile = this.getUserProfile(userId);
    const similarUsers = this.findSimilarUsers(userId, 5);
    
    return {
      profile: {
        totalInteractions: profile.totalInteractions,
        conversionRate: profile.conversionRate,
        averageOrderValue: profile.averageOrderValue,
        lifetimeValue: profile.lifetimeValue,
        topCategories: this.getTopCategories(profile),
        topBrands: this.getTopBrands(profile),
        styleProfile: profile.styleProfile
      },
      similarUsers: similarUsers.map(u => ({ userId: u.userId, similarity: u.similarity })),
      contextualData: this.contextualData,
      recommendations: this.getRecommendations(userId, { limit: 5 })
    };
  }

  getTopCategories(profile, limit = 5) {
    return Object.entries(profile.categoryAffinities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([category, score]) => ({ category, score }));
  }

  getTopBrands(profile, limit = 5) {
    return Object.entries(profile.brandAffinities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([brand, score]) => ({ brand, score }));
  }

  getPersonalizationStatus() {
    return {
      userProfiles: this.userProfiles.size,
      productCatalog: this.productCatalog.size,
      userSimilarities: this.userSimilarities.size,
      experiments: this.experiments.size,
      contextualData: this.contextualData,
      config: this.config
    };
  }
}

// Export for global use
window.PersonalizationEngine = PersonalizationEngine;