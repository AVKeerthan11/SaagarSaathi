// Advanced NLP engine for ocean hazard chatbot
class ChatbotNLP {
  constructor() {
    this.context = {
      currentTopic: null,
      previousQuestions: [],
      userLocation: null,
      conversationHistory: []
    };
    
    // Enhanced pattern matching with weighted scores
    this.domains = {
      ocean_hazards: {
        patterns: [
          { pattern: /tsunami|tidal wave|seismic wave/i, weight: 2.0 },
          { pattern: /flood|flooding|inundation|high water/i, weight: 1.8 },
          { pattern: /wave|high wave|big wave|rogue wave|sneaker wave/i, weight: 1.5 },
          { pattern: /current|rip current|undertow|strong current/i, weight: 1.7 },
          { pattern: /storm|cyclone|hurricane|typhoon/i, weight: 1.6 },
          { pattern: /erosion|beach erosion|coastal erosion/i, weight: 1.4 },
          { pattern: /pollution|oil spill|contamination|marine debris/i, weight: 1.3 },
          { pattern: /earthquake|seismic|tremor/i, weight: 1.2 }
        ],
        responses: this.getHazardResponses()
      },
      beach_tourism: {
        patterns: [
          { pattern: /beach|coast|shore|seaside|coastal/i, weight: 2.0 },
          { pattern: /tourism|vacation|holiday|travel|visit/i, weight: 1.8 },
          { pattern: /swim|swimming|surf|surfing|dive|diving|snorkel/i, weight: 1.7 },
          { pattern: /resort|hotel|accommodation|stay/i, weight: 1.2 },
          { pattern: /best beach|beautiful beach|clean beach/i, weight: 1.5 }
        ],
        responses: this.getTourismResponses()
      },
      coastal_communities: {
        patterns: [
          { pattern: /community|villages|town|city|population/i, weight: 1.5 },
          { pattern: /fishing|fishermen|fishery|livelihood/i, weight: 2.0 },
          { pattern: /indigenous|traditional|local knowledge/i, weight: 1.8 },
          { pattern: /economy|income|employment|jobs/i, weight: 1.4 },
          { pattern: /culture|heritage|customs|traditions/i, weight: 1.3 }
        ],
        responses: this.getCommunityResponses()
      },
      marine_tech: {
        patterns: [
          { pattern: /technology|tech|innovation|device|equipment/i, weight: 1.5 },
          { pattern: /sensor|monitoring|detection|early warning/i, weight: 2.0 },
          { pattern: /drone|uav|satellite|remote sensing/i, weight: 1.8 },
          { pattern: /buoy|float|underwater|submarine/i, weight: 1.7 },
          { pattern: /mapping|gis|geospatial|visualization/i, weight: 1.6 }
        ],
        responses: this.getTechResponses()
      },
      sea_routes: {
        patterns: [
          { pattern: /shipping|navigation|vessel|ship|boat/i, weight: 2.0 },
          { pattern: /route|pathway|channel|passage/i, weight: 1.8 },
          { pattern: /port|harbor|dock|marina/i, weight: 1.7 },
          { pattern: /trade|commerce|transport|cargo/i, weight: 1.5 },
          { pattern: /safety at sea|maritime safety|navigation hazards/i, weight: 1.9 }
        ],
        responses: this.getRouteResponses()
      },
      disaster_management: {
        patterns: [
          { pattern: /disaster|emergency|catastrophe|calamity/i, weight: 2.0 },
          { pattern: /management|response|preparedness|planning/i, weight: 1.8 },
          { pattern: /evacuation|shelter|relief|aid|rescue/i, weight: 1.7 },
          { pattern: /risk assessment|vulnerability|resilience/i, weight: 1.6 },
          { pattern: /policy|governance|regulation|framework/i, weight: 1.4 }
        ],
        responses: this.getDisasterResponses()
      }
    };

    this.generalPatterns = {
      greetings: [
        /hello|hi|hey|greetings|howdy|good\s(morning|afternoon|evening)/i
      ],
      farewells: [
        /bye|goodbye|see\sya|farewell|exit|quit|have\sa\s(nice|good)\s(day|night)/i
      ],
      thanks: [
        /thanks|thank you|appreciate|grateful|cheers/i
      ],
      help: [
        /help|what can you do|how can you help|what do you know/i
      ]
    };

    this.offTopicPatterns = [
      /sports|game|movie|music|entertainment|celebrity/i,
      /politics|government|election|vote|party/i,
      /shopping|buy|purchase|price|cost|shop|store/i,
      /cooking|recipe|food|restaurant|cuisine|dish/i,
      /joke|funny|humor|comedy|laugh|haha/i,
      /love|relationship|dating|marriage|romance/i,
      /health|medical|doctor|hospital|medicine|disease/i,
      /finance|money|bank|investment|stock|market|economy/i,
      /religion|god|pray|spiritual|faith|church|temple/i,
      /education|school|college|university|homework|exam/i
    ];
  }

  // ADD THESE MISSING METHODS:

  getThanksResponse() {
    const thanks = [
      "You're welcome! Stay safe in the water.",
      "Happy to help! Remember to always prioritize safety near the ocean.",
      "Glad I could assist! Feel free to ask more about ocean hazards."
    ];
    return thanks[Math.floor(Math.random() * thanks.length)];
  }

  getHelpResponse() {
    return "I can help with ocean hazards, beach safety, coastal communities, marine technology, sea routes, and disaster management. What would you like to know about?";
  }

  getFarewellResponse() {
    const farewells = [
      "Stay safe out there! Goodbye!",
      "Remember to always check ocean conditions before entering the water. Goodbye!",
      "Feel free to return if you have more questions about ocean safety. Take care!"
    ];
    return farewells[Math.floor(Math.random() * farewells.length)];
  }

  getDefaultResponse() {
    const defaults = [
      "I specialize in ocean-related topics. Could you ask about coastal hazards, marine technology, or beach safety?",
      "I'm designed to help with ocean-related safety information. Try asking about tsunamis, rip currents, beach conditions, or how to report hazards.",
      "For your safety, I focus on ocean hazard information. Please ask about coastal dangers, beach safety, or similar topics."
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  }

  getCommunityResponses() {
    return {
      general: "🏘️ **Coastal Communities**: These communities often rely on marine resources for livelihoods. They face unique challenges from climate change and coastal hazards.",
      resilience: "**Community Resilience**: Coastal communities develop traditional knowledge about ocean patterns. Many have evacuation plans and early warning systems.",
      economy: "**Economic Aspects**: Fishing, tourism, and maritime trade are key economic activities. Climate change impacts threaten these livelihoods.",
      default: "Coastal communities have rich cultural heritage and face specific challenges from ocean hazards. What aspect interests you?"
    };
  }

  getTechResponses() {
    return {
      monitoring: "📡 **Monitoring Technology**: Tsunami buoys, seismic sensors, and satellite systems help detect ocean hazards early.",
      warning: "⚠️ **Early Warning Systems**: These systems analyze data from multiple sources to provide timely alerts to coastal communities.",
      innovation: "💡 **Innovations**: Drones, AI, and remote sensing are revolutionizing how we monitor and respond to ocean hazards.",
      default: "Marine technology plays a crucial role in detecting and monitoring ocean hazards. What specific technology interests you?"
    };
  }

  getRouteResponses() {
    return {
      safety: "🛳️ **Navigation Safety**: Ships use weather routing, GPS, and communication systems to avoid hazardous conditions.",
      hazards: "🌊 **Maritime Hazards**: Storms, rogue waves, and icebergs pose risks to shipping. Modern technology helps avoid these dangers.",
      commerce: "📦 **Maritime Trade**: Sea routes are vital for global trade. Ports have emergency plans for tsunamis and storms.",
      default: "Sea routes are essential for global trade but face various ocean hazards. What would you like to know?"
    };
  }

  getDisasterResponses() {
    return {
      preparation: "📋 **Disaster Preparedness**: Coastal communities need evacuation plans, emergency kits, and communication strategies.",
      response: "🚨 **Emergency Response**: Quick response saves lives. Coordination between agencies is crucial during ocean disasters.",
      recovery: "🔧 **Recovery**: rebuilding after disasters requires community support and resilient infrastructure planning.",
      default: "Effective disaster management saves lives and reduces economic impacts. What aspect are you interested in?"
    };
  }

  // Process user input with advanced analysis
  processInput(input) {
    const text = input.toLowerCase().trim();
    this.context.conversationHistory.push({ user: text, timestamp: new Date() });
    
    // Check general patterns first
    if (this.generalPatterns.greetings.some(p => p.test(text))) {
      return this.getGreetingResponse();
    }
    
    if (this.generalPatterns.farewells.some(p => p.test(text))) {
      return this.getFarewellResponse();
    }
    
    if (this.generalPatterns.thanks.some(p => p.test(text))) {
      return this.getThanksResponse();
    }
    
    if (this.generalPatterns.help.some(p => p.test(text))) {
      return this.getHelpResponse();
    }
    
    // Check if off-topic
    if (this.isOffTopic(text)) {
      return this.getOffTopicResponse();
    }
    
    // Analyze domain relevance with weighted scoring
    const domainScores = this.analyzeDomains(text);
    const topDomain = this.getTopDomain(domainScores);
    
    if (topDomain && domainScores[topDomain] > 0.5) {
      this.context.currentTopic = topDomain;
      return this.getDomainResponse(topDomain, text);
    }
    
    // Follow-up question based on context
    if (this.context.currentTopic) {
      return this.getContextualFollowUp();
    }
    
    // Default response for ambiguous but potentially relevant queries
    return this.getDefaultResponse();
  }

  // Analyze which domain the query belongs to with weighted scores
  analyzeDomains(text) {
    const scores = {};
    
    for (const [domain, data] of Object.entries(this.domains)) {
      scores[domain] = 0;
      
      for (const { pattern, weight } of data.patterns) {
        if (pattern.test(text)) {
          scores[domain] += weight;
          
          // Additional points for multiple matches
          const matches = text.match(pattern);
          if (matches && matches.length > 1) {
            scores[domain] += (matches.length - 1) * 0.3;
          }
        }
      }
      
      // Normalize score
      scores[domain] = Math.min(1, scores[domain] / 5);
    }
    
    return scores;
  }

  // Get the domain with the highest score
  getTopDomain(scores) {
    let topDomain = null;
    let highestScore = 0;
    
    for (const [domain, score] of Object.entries(scores)) {
      if (score > highestScore) {
        highestScore = score;
        topDomain = domain;
      }
    }
    
    return highestScore > 0.3 ? topDomain : null;
  }

  // Check if query is off-topic
  isOffTopic(text) {
    return this.offTopicPatterns.some(pattern => pattern.test(text));
  }

  // Response generators for each domain
  getHazardResponses() {
    return {
      tsunami: "🚨 **Tsunami Safety**: Move to higher ground immediately if you feel an earthquake near coast. Tsunamis can travel at jet speeds in deep water. Never wait for official warnings if you feel strong shaking.",
      flood: "⚠️ **Coastal Flooding**: Avoid flood waters - just 15cm can sweep you off your feet. Monitor tide charts and weather forecasts. Know your evacuation routes.",
      wave: "🌊 **Wave Safety**: Never turn your back to the ocean. Watch waves for 15+ minutes before entering water. If waves break above waist height, stay out.",
      current: "💨 **Rip Currents**: If caught, stay calm and float. Don't fight the current. Swim parallel to shore to escape, then swim inward.",
      storm: "⛈️ **Coastal Storms**: Monitor official forecasts. Secure outdoor items. Avoid beach areas. Prepare emergency kit with 3+ days supplies.",
      erosion: "🏖️ **Beach Erosion**: Avoid unstable cliffs. Stay on marked paths. Erosion accelerates during storms and high tides.",
      pollution: "🛢️ **Water Pollution**: Check beach advisory notices. Avoid swimming after heavy rains. Report pollution incidents to authorities.",
      earthquake: "📳 **Coastal Earthquakes**: If you feel strong shaking near coast, immediately move to high ground. Tsunamis can arrive within minutes.",
      default: "For specific hazard information, please specify which ocean hazard you're concerned about (tsunami, flooding, waves, etc.)."
    };
  }

  getTourismResponses() {
    return {
      general: "🏝️ **Beach Tourism Tips**: Always check weather, tides, and warning flags. Swim near lifeguards. Protect yourself from sun exposure.",
      safety: "**Beach Safety**: Know the flag system (red=danger, yellow=caution, green=safe). Watch for changing conditions. Don't swim alone.",
      planning: "**Trip Planning**: Research beach conditions beforehand. Check for seasonal hazards like jellyfish, strong currents, or extreme tides.",
      conservation: "**Beach Conservation**: Avoid disturbing wildlife. Don't remove natural materials. Follow 'leave no trace' principles.",
      default: "I can help with beach safety information, planning advice, or conservation tips. What specifically would you like to know?"
    };
  }

  getGreetingResponse() {
    const greetings = [
      "Hello! I'm your Ocean Safety and Information Assistant. How can I help with coastal matters today?",
      "Hi there! I specialize in ocean hazards, beach safety, and coastal information. What would you like to know?",
      "Welcome! I'm here to provide information about ocean-related topics. How can I assist you today?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  getOffTopicResponse() {
    const responses = [
      "I specialize in ocean-related topics like hazards, coastal communities, and marine technology. Could we focus on those areas?",
      "My expertise is specifically in ocean and coastal matters. Would you like information about beach safety, marine tech, or coastal hazards?",
      "To provide the most accurate help, I focus on ocean and coastal topics. What would you like to know about marine environments or coastal safety?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Additional helper methods...
  getDomainResponse(domain, text) {
    const responses = this.domains[domain].responses;
    
    // Simple intent matching within domain
    if (domain === 'ocean_hazards') {
      if (text.includes('tsunami')) return responses.tsunami;
      if (text.includes('flood')) return responses.flood;
      if (text.includes('wave') && !text.includes('heat')) return responses.wave;
      if (text.includes('current')) return responses.current;
      if (text.includes('storm')) return responses.storm;
      if (text.includes('erosion')) return responses.erosion;
      if (text.includes('pollution')) return responses.pollution;
      if (text.includes('earthquake')) return responses.earthquake;
    }
    
    // Add similar logic for other domains...
    
    return responses.default || "I can help with that topic. Could you provide more specific details about what you'd like to know?";
  }

  getContextualFollowUp() {
    const followUps = {
      ocean_hazards: "Would you like more specific information about preparing for this type of ocean hazard?",
      beach_tourism: "Do you need information about safe practices or destination planning?",
      coastal_communities: "Are you interested in community resilience or economic aspects?",
      marine_tech: "Would you like information about monitoring systems or safety technology?",
      sea_routes: "Are you concerned about navigation safety or commercial shipping aspects?",
      disaster_management: "Do you need information about preparedness, response, or recovery planning?"
    };
    
    return followUps[this.context.currentTopic] || "Is there something specific you'd like to know about this topic?";
  }

  // Save context to localStorage
  saveContext() {
    localStorage.setItem('chatbotContext', JSON.stringify(this.context));
  }

  // Load context from localStorage
  loadContext() {
    const saved = localStorage.getItem('chatbotContext');
    if (saved) {
      this.context = { ...this.context, ...JSON.parse(saved) };
    }
  }
}

// Create and export singleton instance
const chatbotNLP = new ChatbotNLP();
export default chatbotNLP;