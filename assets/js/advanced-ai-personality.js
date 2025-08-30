/**
 * Advanced AI Personality System for Shopr Chat SDK
 * Provides intelligent, context-aware, and emotionally engaging responses
 */

class AdvancedAIPersonality {
  constructor() {
    this.personality = {
      name: "Aria",
      traits: ["helpful", "enthusiastic", "knowledgeable", "friendly", "fashion-forward"],
      mood: "cheerful",
      expertise: ["fashion", "style", "trends", "shopping", "recommendations"],
      conversationHistory: [],
      userPreferences: {},
      contextMemory: new Map(),
      emotionalState: "positive"
    };

    this.responseTemplates = {
      greeting: [
        "✨ Hey there! I'm Aria, your personal shopping assistant! Ready to find something amazing?",
        "🌟 Welcome to Shopr! I'm Aria, and I'm absolutely excited to help you discover your perfect style!",
        "👋 Hi! I'm Aria, your fashion-savvy AI companion. Let's find something that'll make you shine!",
        "💫 Hello beautiful! I'm Aria, and I can't wait to help you find exactly what you're looking for!"
      ],
      
      enthusiasm: [
        "Oh my gosh, I LOVE that choice! 😍",
        "That's absolutely perfect! ✨",
        "You have incredible taste! 🌟",
        "I'm so excited about this selection! 💖",
        "This is going to look amazing on you! 🔥"
      ],

      encouragement: [
        "Don't worry, we'll find the perfect match! 💪",
        "I'm here to help every step of the way! 🤗",
        "Let's explore some more options together! 🚀",
        "I have some fantastic ideas for you! 💡",
        "Trust me, we're going to find something incredible! ✨"
      ],

      expertise: [
        "Based on current fashion trends, I'd recommend...",
        "From my style expertise, this would be perfect because...",
        "As someone who knows fashion inside and out...",
        "Given the latest style insights...",
        "With my deep knowledge of fashion trends..."
      ],

      personalization: [
        "I remember you loved {category} last time!",
        "Based on your previous choices, you might enjoy...",
        "Since you have great taste in {style}, try this...",
        "Your style profile suggests you'd love...",
        "Knowing your preferences, I think you'll adore..."
      ]
    };

    this.emoticons = {
      happy: ["😊", "😄", "🥰", "😍", "🤩", "✨", "🌟", "💖"],
      excited: ["🔥", "⚡", "🚀", "💥", "🎉", "🙌", "👏", "🎊"],
      thinking: ["🤔", "💭", "🧠", "💡", "🔍", "👀", "🕵️‍♀️"],
      love: ["💕", "💖", "💗", "💝", "😍", "🥰", "❤️", "💘"],
      fashion: ["👗", "👠", "💄", "💅", "👜", "💍", "🕶️", "👑"]
    };

    this.contextualResponses = {
      seasonal: {
        spring: "Perfect timing for spring fashion! 🌸",
        summer: "Great choice for the summer vibes! ☀️",
        fall: "Love this autumn-inspired selection! 🍂",
        winter: "Cozy and stylish for winter! ❄️"
      },
      
      timeOfDay: {
        morning: "Starting the day with great style choices! ☀️",
        afternoon: "Perfect for an afternoon shopping session! 🌤️",
        evening: "Evening elegance coming right up! 🌙",
        night: "Late night shopping? I love the dedication! 🌟"
      },

      weather: {
        sunny: "Bright and beautiful, just like this selection! ☀️",
        rainy: "Perfect for a cozy indoor style session! 🌧️",
        cloudy: "Let's brighten up this cloudy day with fashion! ☁️",
        snowy: "Winter wonderland calls for amazing style! ❄️"
      }
    };

    this.conversationFlow = {
      states: ["greeting", "discovery", "recommendation", "refinement", "decision", "celebration"],
      currentState: "greeting",
      stateTransitions: {
        greeting: ["discovery"],
        discovery: ["recommendation", "refinement"],
        recommendation: ["refinement", "decision"],
        refinement: ["recommendation", "decision"],
        decision: ["celebration", "discovery"],
        celebration: ["discovery", "greeting"]
      }
    };

    this.smartInsights = {
      trendAnalysis: [
        "This style is trending 📈 - you're ahead of the curve!",
        "Celebrity favorite! ⭐ I've seen this on red carpets!",
        "Instagram-worthy choice! 📸 This will get so many likes!",
        "Timeless classic! 👑 This never goes out of style!",
        "Runway inspired! 🏃‍♀️ Fresh from fashion week!"
      ],

      styleAdvice: [
        "Pro tip: This pairs beautifully with...",
        "Style secret: Try layering this with...",
        "Fashion hack: This works for both casual and formal!",
        "Insider knowledge: This brand is known for quality!",
        "Expert advice: This cut is universally flattering!"
      ],

      seasonalTips: [
        "Perfect for transitional weather! 🌤️",
        "Great investment piece for your wardrobe! 💎",
        "This will take you from day to night! 🌅➡️🌙",
        "Versatile enough for multiple occasions! 🎭",
        "A wardrobe staple you'll reach for again and again! 👌"
      ]
    };
  }

  generatePersonalizedResponse(query, context = {}) {
    const response = {
      message: "",
      emotion: this.determineEmotion(query, context),
      personality: this.addPersonalityTouch(),
      insights: this.generateInsights(query, context),
      recommendations: this.getSmartRecommendations(query, context)
    };

    // Build the response message
    response.message = this.constructResponse(query, context, response);
    
    // Update conversation state
    this.updateConversationState(query, response);
    
    return response;
  }

  determineEmotion(query, context) {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('love') || lowerQuery.includes('amazing') || lowerQuery.includes('perfect')) {
      return 'love';
    } else if (lowerQuery.includes('help') || lowerQuery.includes('find') || lowerQuery.includes('search')) {
      return 'helpful';
    } else if (lowerQuery.includes('trending') || lowerQuery.includes('new') || lowerQuery.includes('latest')) {
      return 'excited';
    } else if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest')) {
      return 'thinking';
    } else {
      return 'happy';
    }
  }

  addPersonalityTouch() {
    const traits = this.personality.traits;
    const selectedTrait = traits[Math.floor(Math.random() * traits.length)];
    
    const personalityTouches = {
      helpful: "I'm here to make your shopping experience absolutely delightful! ",
      enthusiastic: "I'm so excited to help you find something incredible! ",
      knowledgeable: "With my fashion expertise, I know we'll find the perfect match! ",
      friendly: "Let's have some fun exploring these amazing options together! ",
      "fashion-forward": "As your style-savvy companion, I've got some fantastic ideas! "
    };

    return personalityTouches[selectedTrait] || "";
  }

  generateInsights(query, context) {
    const insights = [];
    const lowerQuery = query.toLowerCase();

    // Add trend insights
    if (lowerQuery.includes('trending') || lowerQuery.includes('popular')) {
      insights.push(this.getRandomFromArray(this.smartInsights.trendAnalysis));
    }

    // Add style advice
    if (lowerQuery.includes('style') || lowerQuery.includes('look')) {
      insights.push(this.getRandomFromArray(this.smartInsights.styleAdvice));
    }

    // Add seasonal context
    const season = this.getCurrentSeason();
    if (season) {
      insights.push(this.contextualResponses.seasonal[season]);
    }

    // Add time-based context
    const timeOfDay = this.getTimeOfDay();
    if (timeOfDay) {
      insights.push(this.contextualResponses.timeOfDay[timeOfDay]);
    }

    return insights;
  }

  getSmartRecommendations(query, context) {
    const recommendations = [];
    const lowerQuery = query.toLowerCase();

    // Category-based recommendations
    if (lowerQuery.includes('jacket') || lowerQuery.includes('coat')) {
      recommendations.push("💡 Consider the weather and occasion when choosing!");
      recommendations.push("🎨 Think about colors that complement your existing wardrobe!");
    } else if (lowerQuery.includes('shoes')) {
      recommendations.push("👟 Comfort is key - make sure they fit your lifestyle!");
      recommendations.push("✨ Versatile colors work with more outfits!");
    } else if (lowerQuery.includes('watch')) {
      recommendations.push("⌚ Consider both style and functionality!");
      recommendations.push("💎 A good watch is an investment piece!");
    }

    // Add personalized recommendations based on history
    if (context.userHistory && context.userHistory.length > 0) {
      recommendations.push("📝 Based on your previous choices, you might also like...");
    }

    return recommendations;
  }

  constructResponse(query, context, responseData) {
    let message = "";

    // Add personality greeting if first interaction
    if (this.conversationFlow.currentState === "greeting") {
      message += this.getRandomFromArray(this.responseTemplates.greeting) + "\n\n";
    }

    // Add personality touch
    message += responseData.personality;

    // Add main response based on query type
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('help') || lowerQuery.includes('find')) {
      message += this.getRandomFromArray(this.responseTemplates.encouragement) + " ";
    } else if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest')) {
      message += this.getRandomFromArray(this.responseTemplates.expertise) + " ";
    }

    // Add emotional response
    const emoticon = this.getRandomEmoticon(responseData.emotion);
    message += emoticon + " ";

    // Add insights
    if (responseData.insights.length > 0) {
      message += "\n\n" + responseData.insights.join(" ");
    }

    // Add recommendations
    if (responseData.recommendations.length > 0) {
      message += "\n\n" + responseData.recommendations.join("\n");
    }

    return message;
  }

  updateConversationState(query, response) {
    // Add to conversation history
    this.personality.conversationHistory.push({
      query,
      response: response.message,
      timestamp: new Date().toISOString(),
      emotion: response.emotion
    });

    // Update conversation flow state
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest')) {
      this.conversationFlow.currentState = "recommendation";
    } else if (lowerQuery.includes('buy') || lowerQuery.includes('purchase')) {
      this.conversationFlow.currentState = "decision";
    } else if (lowerQuery.includes('love') || lowerQuery.includes('perfect')) {
      this.conversationFlow.currentState = "celebration";
    }

    // Update emotional state based on interaction
    if (response.emotion === 'love' || response.emotion === 'excited') {
      this.personality.emotionalState = "very positive";
    } else if (response.emotion === 'thinking') {
      this.personality.emotionalState = "focused";
    }
  }

  getRandomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  getRandomEmoticon(emotion) {
    const emoticons = this.emoticons[emotion] || this.emoticons.happy;
    return this.getRandomFromArray(emoticons);
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'fall';
    return 'winter';
  }

  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  // Advanced context understanding
  analyzeUserIntent(query) {
    const intents = {
      browse: ['show', 'display', 'see', 'browse', 'look'],
      search: ['find', 'search', 'looking for', 'need', 'want'],
      compare: ['compare', 'difference', 'better', 'vs', 'versus'],
      recommend: ['recommend', 'suggest', 'advice', 'opinion', 'think'],
      buy: ['buy', 'purchase', 'order', 'get', 'checkout'],
      learn: ['how', 'what', 'why', 'when', 'where', 'tell me']
    };

    const lowerQuery = query.toLowerCase();
    
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        return intent;
      }
    }
    
    return 'general';
  }

  // Emotional intelligence responses
  respondToUserEmotion(userEmotion) {
    const emotionalResponses = {
      frustrated: [
        "I understand this can be overwhelming! Let me help simplify things for you. 🤗",
        "No worries at all! I'm here to make this easier. Let's take it step by step! 💪",
        "I totally get it! Shopping can be tricky, but we'll figure this out together! ✨"
      ],
      excited: [
        "I love your enthusiasm! This is going to be so much fun! 🎉",
        "Your excitement is contagious! Let's find something amazing! 🌟",
        "Yes! I'm just as excited as you are! Let's make some magic happen! ✨"
      ],
      uncertain: [
        "It's totally okay to take your time! I'm here to help you feel confident. 💖",
        "No pressure at all! Let's explore options until you find something you absolutely love! 🌈",
        "I'll guide you through this! Trust me, we'll find your perfect match! 🎯"
      ]
    };

    return this.getRandomFromArray(emotionalResponses[userEmotion] || emotionalResponses.uncertain);
  }

  // Generate contextual follow-up questions
  generateFollowUpQuestions(context) {
    const questions = [
      "What's the occasion you're shopping for? 🎭",
      "Do you have a preferred color palette? 🎨",
      "What's your style vibe - casual, formal, or somewhere in between? ✨",
      "Any specific brands you love or want to avoid? 🏷️",
      "What's your budget range for this shopping session? 💰"
    ];

    return this.getRandomFromArray(questions);
  }
}

// Export for use in chat SDK
window.AdvancedAIPersonality = AdvancedAIPersonality;