// Enhanced NLP engine for ocean hazard chatbot with improved pattern matching
class ChatbotNLP {
  constructor() {
    this.context = {
      currentTopic: null,
      previousQuestions: [],
      userLocation: null,
      conversationHistory: []
    };
    
    // Enhanced pattern matching with more specific patterns
    this.domains = {
      ocean_hazards: {
        patterns: [
          { pattern: /\b(tsunami|tidal wave|seismic wave)\b/i, weight: 2.5 },
          { pattern: /\b(flood|flooding|inundation|high water|water level)\b/i, weight: 2.2 },
          { pattern: /\b(wave|high wave|big wave|rogue wave|sneaker wave|swell)\b/i, weight: 2.0 },
          { pattern: /\b(current|rip current|undertow|strong current|riptide)\b/i, weight: 2.3 },
          { pattern: /\b(storm|cyclone|hurricane|typhoon|low pressure)\b/i, weight: 2.1 },
          { pattern: /\b(erosion|beach erosion|coastal erosion|shoreline)\b/i, weight: 1.9 },
          { pattern: /\b(pollution|oil spill|contamination|marine debris|plastic)\b/i, weight: 1.8 },
          { pattern: /\b(earthquake|seismic|tremor|ground shake)\b/i, weight: 2.0 },
          { pattern: /\b(safety|danger|risk|hazard|warning|alert)\b/i, weight: 1.5 },
          { pattern: /\b(avoid|unsafe|dangerous|caution|warning)\b/i, weight: 1.4 }
        ],
        responses: this.getHazardResponses()
      },
      beach_tourism: {
        patterns: [
          { pattern: /\b(beach|coast|shore|seaside|coastal|sand)\b/i, weight: 2.2 },
          { pattern: /\b(tourism|vacation|holiday|travel|visit|tourist)\b/i, weight: 2.0 },
          { pattern: /\b(swim|swimming|surf|surfing|dive|diving|snorkel|paddle)\b/i, weight: 2.1 },
          { pattern: /\b(resort|hotel|accommodation|stay|lodging)\b/i, weight: 1.5 },
          { pattern: /\b(best beach|beautiful beach|clean beach|safe beach)\b/i, weight: 2.3 },
          { pattern: /\b(recommend|suggest|good place|where to go)\b/i, weight: 1.8 }
        ],
        responses: this.getTourismResponses()
      },
      coastal_communities: {
        patterns: [
          { pattern: /\b(community|villages|town|city|population|people)\b/i, weight: 1.8 },
          { pattern: /\b(fishing|fishermen|fishery|livelihood|catch|fish market)\b/i, weight: 2.3 },
          { pattern: /\b(indigenous|traditional|local knowledge|culture|heritage)\b/i, weight: 2.0 },
          { pattern: /\b(economy|income|employment|jobs|business|trade)\b/i, weight: 1.7 },
          { pattern: /\b(culture|heritage|customs|traditions|festival)\b/i, weight: 1.6 }
        ],
        responses: this.getCommunityResponses()
      },
      marine_tech: {
        patterns: [
          { pattern: /\b(technology|tech|innovation|device|equipment|gadget)\b/i, weight: 1.8 },
          { pattern: /\b(sensor|monitoring|detection|early warning|alert system)\b/i, weight: 2.4 },
          { pattern: /\b(drone|uav|satellite|remote sensing|aerial)\b/i, weight: 2.2 },
          { pattern: /\b(buoy|float|underwater|submarine|oceanographic)\b/i, weight: 2.1 },
          { pattern: /\b(mapping|gis|geospatial|visualization|chart)\b/i, weight: 1.9 },
          { pattern: /\b(incois|data|forecast|prediction|model)\b/i, weight: 2.3 }
        ],
        responses: this.getTechResponses()
      },
      sea_routes: {
        patterns: [
          { pattern: /\b(shipping|navigation|vessel|ship|boat|yacht)\b/i, weight: 2.3 },
          { pattern: /\b(route|pathway|channel|passage|shipping lane)\b/i, weight: 2.1 },
          { pattern: /\b(port|harbor|dock|marina|anchorage)\b/i, weight: 2.0 },
          { pattern: /\b(trade|commerce|transport|cargo|freight)\b/i, weight: 1.8 },
          { pattern: /\b(safety at sea|maritime safety|navigation hazards)\b/i, weight: 2.4 }
        ],
        responses: this.getRouteResponses()
      },
      disaster_management: {
        patterns: [
          { pattern: /\b(disaster|emergency|catastrophe|calamity|crisis)\b/i, weight: 2.3 },
          { pattern: /\b(management|response|preparedness|planning|readiness)\b/i, weight: 2.1 },
          { pattern: /\b(evacuation|shelter|relief|aid|rescue|recovery)\b/i, weight: 2.2 },
          { pattern: /\b(risk assessment|vulnerability|resilience|capacity)\b/i, weight: 1.9 },
          { pattern: /\b(policy|governance|regulation|framework|guideline)\b/i, weight: 1.7 }
        ],
        responses: this.getDisasterResponses()
      },
      marine_life: {
        patterns: [
          { pattern: /\b(marine life|sea life|ocean life|marine species)\b/i, weight: 2.4 },
          { pattern: /\b(coral|reef|coral reef|polyps)\b/i, weight: 2.2 },
          { pattern: /\b(fish|fishing|fisheries|aquatic|sea creature)\b/i, weight: 2.1 },
          { pattern: /\b(mammal|dolphin|whale|turtle|seal|dugong)\b/i, weight: 2.0 },
          { pattern: /\b(ecosystem|habitat|biodiversity|environment)\b/i, weight: 1.9 },
          { pattern: /\b(conservation|protection|endangered|preservation)\b/i, weight: 2.0 }
        ],
        responses: this.getMarineLifeResponses()
      },
      weather_patterns: {
        patterns: [
          { pattern: /\b(weather|climate|forecast|meteorology)\b/i, weight: 2.2 },
          { pattern: /\b(monsoon|rain|rainfall|season|wind pattern)\b/i, weight: 2.3 },
          { pattern: /\b(temperature|warming|cooling|heat|cold)\b/i, weight: 1.9 },
          { pattern: /\b(el nino|la nina|enso|climate pattern)\b/i, weight: 2.4 },
          { pattern: /\b(cyclone|depression|low pressure|storm system)\b/i, weight: 2.3 }
        ],
        responses: this.getWeatherResponses()
      }
    };

    this.generalPatterns = {
      greetings: [
        /^(hello|hi|hey|greetings|howdy|good\s(morning|afternoon|evening))/i
      ],
      farewells: [
        /^(bye|goodbye|see\sya|farewell|exit|quit|have\sa\s(nice|good)\s(day|night))/i
      ],
      thanks: [
        /^(thanks|thank you|appreciate|grateful|cheers)/i
      ],
      help: [
        /^(help|what can you do|how can you help|what do you know)/i
      ],
      places_to_avoid: [
        /(places to avoid|dangerous areas|unsafe locations|where not to go|avoid which places|risky areas)/i
      ],
      places_to_visit: [
        /(places to visit|safe areas|good locations|where to go|recommended places|preferred places|best spots)/i
      ],
      incois_data: [
        /(incois|indian national centre for ocean information services|ocean data|forecast data|satellite data|marine data)/i
      ],
      // Add more specific patterns
      how_questions: [
        /how\s+(do|does|can|should|would|might|will|to)/i
      ],
      what_questions: [
        /what\s+(is|are|do|does|can|should|would|might|will)/i
      ],
      where_questions: [
        /where\s+(is|are|can|should|would|might|will)/i
      ],
      when_questions: [
        /when\s+(is|are|do|does|can|should|would|might|will)/i
      ],
      why_questions: [
        /why\s+(is|are|do|does|can|should|would|might|will)/i
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

    // Sample hotspot data
    this.hotspotData = [
      { name: "Marina Beach, Chennai", reason: "Rip currents reported", severity: "high", type: "current" },
      { name: "Puri Beach, Odisha", reason: "Coastal erosion", severity: "medium", type: "erosion" },
      { name: "Juhu Beach, Mumbai", reason: "Water pollution", severity: "high", type: "pollution" },
      { name: "Kovalam Beach, Kerala", reason: "Strong undertow", severity: "medium", type: "current" },
      { name: "Goa Beaches", reason: "Monsoon season strong waves", severity: "medium", type: "wave" }
    ];

    // Sample safe locations with positive sentiment
    this.safeLocations = [
      { name: "Radhanagar Beach, Andaman", description: "Clear waters, lifeguards on duty", rating: "Excellent" },
      { name: "Varkala Beach, Kerala", description: "Cliff-backed beach with minimal currents", rating: "Very Good" },
      { name: "Gokarna Beach, Karnataka", description: "Relatively calm waters, good for swimming", rating: "Good" },
      { name: "Rushikonda Beach, Vizag", description: "Well-maintained, patrols available", rating: "Very Good" },
      { name: "Tarkarli Beach, Maharashtra", description: "Clear waters, water sports available", rating: "Good" }
    ];

    this.loadContext();
  }

  // INCOIS Data Integration (simulated - would connect to real API in production)
  async getINCOISData(dataType) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const data = {
      tsunami: {
        status: "No alert",
        message: "No tsunami warning currently active for Indian coastal regions.",
        lastUpdated: new Date().toISOString()
      },
      waves: {
        forecast: "Wave height of 0.5-1.5 meters along most coasts",
        warning: "Higher waves (2-3m) expected along Kerala and Karnataka coasts",
        lastUpdated: new Date().toISOString()
      },
      currents: {
        status: "Moderate currents along most coasts",
        warning: "Strong rip currents reported at specific beaches (see hotspots)",
        lastUpdated: new Date().toISOString()
      },
      sst: {
        value: "28-30°C",
        anomaly: "+0.5°C above normal",
        lastUpdated: new Date().toISOString()
      }
    };
    
    return data[dataType] || null;
  }

  getThanksResponse() {
    const thanks = [
      "You're welcome! Stay safe in the water. 🌊",
      "Happy to help! Remember to always prioritize safety near the ocean. 🏖️",
      "Glad I could assist! Feel free to ask more about ocean hazards. 🤿"
    ];
    return thanks[Math.floor(Math.random() * thanks.length)];
  }

  getHelpResponse() {
    return `I'm your Ocean Safety Assistant! I can help with:
• Ocean hazards and safety tips 🌊
• Beach conditions and recommendations 🏖️  
• Marine life information 🐠
• Weather patterns and forecasts ⛅
• Disaster preparedness and recovery 🚨
• INCOIS data and ocean forecasts 📡
• Coastal community information 🏘️
• Marine technology 🛰️

What would you like to know about?`;
  }

  getFarewellResponse() {
    const farewells = [
      "Stay safe out there! Remember to check ocean conditions before entering the water. Goodbye! 👋",
      "Feel free to return if you have more questions about ocean safety. Take care! 🌊",
      "Thank you for chatting! Always respect the ocean and its power. Farewell! 🏖️"
    ];
    return farewells[Math.floor(Math.random() * farewells.length)];
  }

  getDefaultResponse() {
    const defaults = [
      "I specialize in ocean-related topics. Could you ask about coastal hazards, marine technology, beach safety, or similar topics? 🌊",
      "I'm designed to help with ocean-related safety information. Try asking about tsunamis, rip currents, beach conditions, marine life, or how to report hazards. 🏖️",
      "For your safety, I focus on ocean hazard information. Please ask about coastal dangers, beach safety, marine ecosystems, or similar topics. 🤿"
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  }

  // Get places to avoid (hotspots)
  getPlacesToAvoid() {
    if (this.hotspotData.length === 0) {
      return "Currently, there are no major hazard hotspots reported. However, always exercise caution when near the ocean and check local conditions. 🌊";
    }
    
    let response = "🚫 **Areas to exercise caution** (based on recent reports):\n\n";
    
    this.hotspotData.forEach((location, index) => {
      response += `${index + 1}. **${location.name}** - ${location.reason} (${location.severity} risk)\n`;
    });
    
    response += "\nAlways check current conditions before visiting any beach area, as conditions can change rapidly. For real-time alerts, visit the INCOIS website.";
    
    return response;
  }

  // Get recommended places to visit
  getPlacesToVisit() {
    let response = "✅ **Recommended beach areas** (based on safety records):\n\n";
    
    this.safeLocations.forEach((location, index) => {
      response += `${index + 1}. **${location.name}** - ${location.description} (Safety rating: ${location.rating})\n`;
    });
    
    response += "\nRemember that ocean conditions can change rapidly. Always check local forecasts, heed warning signs, and swim near lifeguards when possible.";
    
    return response;
  }

  getCommunityResponses() {
    return {
      general: "🏘️ **Coastal Communities**: Over 40% of India's population lives in coastal areas, relying on marine resources for livelihoods. These communities face unique challenges from climate change, coastal erosion, and natural hazards.",
      resilience: "**Community Resilience**: Traditional knowledge combined with modern early warning systems helps coastal communities prepare for hazards. Many communities have evacuation plans and disaster response protocols.",
      economy: "**Economic Aspects**: Fishing, tourism, and maritime trade employ millions in coastal regions. Climate change impacts like sea-level rise and changing fish stocks threaten these livelihoods.",
      default: "Coastal communities have rich cultural heritage and face specific challenges from ocean hazards. What aspect interests you most - resilience strategies, economic impacts, or cultural aspects?"
    };
  }

  getTechResponses() {
    return {
      monitoring: "📡 **Monitoring Technology**: INCOIS uses tsunami buoys, seismic sensors, satellite systems, and coastal radars to detect ocean hazards early. Real-time data helps issue timely warnings.",
      warning: "⚠️ **Early Warning Systems**: India's tsunami early warning system can detect earthquakes and issue alerts within 10-20 minutes. Systems also exist for storm surges, high waves, and rip currents.",
      innovation: "💡 **Innovations**: Drones, AI, remote sensing, and underwater gliders are revolutionizing ocean monitoring. INCOIS's 'Satark' app provides real-time alerts to fishermen and coastal communities.",
      default: "Marine technology plays a crucial role in detecting and monitoring ocean hazards. What specific technology interests you - monitoring systems, warning systems, or recent innovations?"
    };
  }

  getRouteResponses() {
    return {
      safety: "🛳️ **Navigation Safety**: Ships use weather routing, GPS, AIS, and communication systems to avoid hazardous conditions. The Indian Navy and Coast Guard monitor maritime safety.",
      hazards: "🌊 **Maritime Hazards**: Storms, rogue waves, piracy, and icebergs pose risks to shipping. Modern technology helps avoid these dangers, but changing climate patterns increase risks.",
      commerce: "📦 **Maritime Trade**: 95% of India's trade by volume moves by sea. Major ports have emergency plans for tsunamis, storms, and pollution incidents.",
      default: "Sea routes are essential for global trade but face various ocean hazards. What would you like to know about - navigation safety, maritime hazards, or commercial shipping aspects?"
    };
  }

  getDisasterResponses() {
    return {
      preparation: "📋 **Disaster Preparedness**: Coastal communities need evacuation plans, emergency kits, communication strategies, and regular drills. Know your evacuation route and meeting points.",
      response: "🚨 **Emergency Response**: Quick response saves lives. NDMA, State Disaster Response Forces, and Coast Guard coordinate during ocean disasters. Follow official instructions immediately.",
      recovery: "🔧 **Recovery**: Rebuilding after disasters requires community support, mental health services, and resilient infrastructure planning. Learn from past events to build back better.",
      default: "Effective disaster management saves lives and reduces economic impacts. What aspect are you interested in - preparedness, response, or recovery planning?"
    };
  }

  getMarineLifeResponses() {
    return {
      general: "🐠 **Marine Biodiversity**: India's coastal waters host diverse ecosystems including coral reefs, mangroves, seagrass beds, and countless marine species. These ecosystems face threats from pollution, climate change, and overfishing.",
      conservation: "🌿 **Conservation Efforts**: Marine Protected Areas, fishing regulations, and pollution control help protect marine life. Coral reef restoration and turtle conservation programs show promising results.",
      threats: "⚠️ **Threats to Marine Life**: Plastic pollution, climate change (coral bleaching), overfishing, and habitat destruction threaten marine biodiversity. Sustainable practices are crucial for protection.",
      default: "India's marine ecosystems are incredibly diverse but face significant threats. What would you like to know about - general biodiversity, conservation efforts, or specific threats?"
    };
  }

  getWeatherResponses() {
    return {
      monsoon: "🌧️ **Monsoon Patterns**: India's climate is dominated by the Southwest (June-Sept) and Northeast (Oct-Dec) monsoons. These bring rainfall but also rough seas and coastal hazards.",
      climate: "🌡️ **Climate Change Impacts**: Sea-level rise, warming oceans, increased cyclone intensity, and changing rainfall patterns affect coastal areas. Adaptation strategies are increasingly important.",
      forecasting: "📡 **Weather Forecasting**: IMD and INCOIS provide marine weather forecasts, cyclone warnings, and ocean state forecasts. These help fishermen, sailors, and coastal communities prepare.",
      default: "Weather and climate patterns significantly impact ocean conditions and coastal safety. What would you like to know about - monsoon patterns, climate change impacts, or forecasting methods?"
    };
  }

  getHazardResponses() {
    return {
      tsunami: "🚨 **Tsunami Safety**: If you feel strong shaking near coast, move immediately to high ground. Tsunamis can travel at jet speeds (800 km/h) in deep water. Never wait for official warnings if you feel strong shaking. INCOIS issues alerts within 10-20 minutes of undersea earthquakes.",
      flood: "⚠️ **Coastal Flooding**: Avoid flood waters - just 15cm can sweep you off your feet. Monitor tide charts, weather forecasts, and INCOIS alerts. Know your evacuation routes and safe zones. Urban coastal flooding is increasing due to sea-level rise.",
      wave: "🌊 **Wave Safety**: Never turn your back to the ocean. Watch waves for 15+ minutes before entering water. If waves break above waist height, stay out. Rogue waves can occur even in calm conditions. Check INCOIS wave forecasts before beach activities.",
      current: "💨 **Rip Currents**: If caught, stay calm and float. Don't fight the current. Swim parallel to shore to escape, then swim inward. Rip currents account for 80% of beach rescues. Look for choppy, discolored water moving seaward.",
      storm: "⛈️ **Coastal Storms**: Monitor IMD and INCOIS forecasts. Secure outdoor items, avoid beach areas, prepare emergency kit with 3+ days supplies. Know your evacuation zone and route. Cyclone shelters are available in vulnerable areas.",
      erosion: "🏖️ **Beach Erosion**: Avoid unstable cliffs. Stay on marked paths. Erosion accelerates during storms and high tides. Nearly 40% of India's coastline faces erosion issues. Coastal regulation zones help manage development.",
      pollution: "🛢️ **Water Pollution**: Check beach advisory notices. Avoid swimming after heavy rains due to runoff pollution. Report pollution incidents to authorities. Plastic pollution harms marine life and ecosystems.",
      earthquake: "📳 **Coastal Earthquakes**: If you feel strong shaking near coast, immediately move to high ground. Tsunamis can arrive within minutes. Drop, cover, and hold on during shaking. After shaking stops, move inland and uphill.",
      default: "For specific hazard information, please specify which ocean hazard concerns you (tsunami, flooding, waves, currents, etc.). I can also provide INCOIS forecast data for current conditions."
    };
  }

  getTourismResponses() {
    return {
      general: "🏝️ **Beach Tourism Tips**: Always check weather, tides, and warning flags. Swim near lifeguards. Protect yourself from sun exposure. Respect local regulations and marine life. Avoid littering and damaging coral reefs.",
      safety: "**Beach Safety**: Know the flag system (red=danger, yellow=caution, green=safe). Watch for changing conditions. Don't swim alone or under influence. Learn basic water safety and CPR. Many beaches lack lifeguards - exercise extra caution.",
      planning: "**Trip Planning**: Research beach conditions beforehand. Check for seasonal hazards like jellyfish, strong currents, or extreme tides. Monsoon season (June-Sept) brings rough seas to west coast. Northeast monsoon affects east coast Oct-Dec.",
      conservation: "**Beach Conservation**: Avoid disturbing wildlife. Don't remove natural materials. Follow 'leave no trace' principles. Use reef-safe sunscreen. Participate in beach cleanups. Support eco-friendly tourism operators.",
      default: "I can help with beach safety information, planning advice, or conservation tips. What specifically would you like to know? I can also recommend safer beach areas based on current conditions."
    };
  }

  getGreetingResponse() {
    const greetings = [
      "Hello! I'm your Ocean Safety and Information Assistant. I can help with ocean hazards, beach safety, marine life, and INCOIS data. How can I assist you today? 🌊",
      "Hi there! I specialize in ocean hazards, beach safety, coastal information, and marine ecosystems. What would you like to know? 🏖️",
      "Welcome! I'm here to provide information about ocean-related topics including safety, marine life, weather patterns, and disaster preparedness. How can I help? 🤿"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  getOffTopicResponse() {
    const responses = [
      "I specialize in ocean-related topics like hazards, coastal communities, marine technology, and beach safety. Could we focus on those areas? 🌊",
      "My expertise is specifically in ocean and coastal matters. Would you like information about beach safety, marine tech, coastal hazards, or INCOIS data? 🏖️",
      "To provide the most accurate help, I focus on ocean and coastal topics. What would you like to know about marine environments, coastal safety, or oceanography? 🤿"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Process user input with advanced analysis
  async processInput(input) {
    const text = input.toLowerCase().trim();
    this.context.conversationHistory.push({ user: text, timestamp: new Date() });
    
    // Check general patterns first with more specific matching
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
    
    if (this.generalPatterns.places_to_avoid.some(p => p.test(text))) {
      return this.getPlacesToAvoid();
    }
    
    if (this.generalPatterns.places_to_visit.some(p => p.test(text))) {
      return this.getPlacesToVisit();
    }
    
    // Check for INCOIS data requests
    if (this.generalPatterns.incois_data.some(p => p.test(text))) {
      if (text.includes('tsunami')) {
        const data = await this.getINCOISData('tsunami');
        return `📡 **INCOIS Tsunami Alert**: ${data.status}\n${data.message}\n\nLast updated: ${new Date(data.lastUpdated).toLocaleString()}`;
      } else if (text.includes('wave')) {
        const data = await this.getINCOISData('waves');
        return `🌊 **INCOIS Wave Forecast**: ${data.forecast}\n${data.warning ? `⚠️ ${data.warning}` : ''}\n\nLast updated: ${new Date(data.lastUpdated).toLocaleString()}`;
      } else if (text.includes('current')) {
        const data = await this.getINCOISData('currents');
        return `💨 **INCOIS Current Information**: ${data.status}\n${data.warning ? `⚠️ ${data.warning}` : ''}\n\nLast updated: ${new Date(data.lastUpdated).toLocaleString()}`;
      } else {
        return "I can access INCOIS data about tsunamis, waves, currents, and sea surface temperatures. What specific information would you like?";
      }
    }
    
    // Check if off-topic
    if (this.isOffTopic(text)) {
      return this.getOffTopicResponse();
    }
    
    // Check for question patterns and provide appropriate responses
    if (this.generalPatterns.how_questions.some(p => p.test(text))) {
      if (text.includes('tsunami') || text.includes('wave') || text.includes('current') || 
          text.includes('flood') || text.includes('storm') || text.includes('erosion')) {
        return this.getDomainResponse('ocean_hazards', text);
      }
      if (text.includes('beach') || text.includes('swim') || text.includes('surf')) {
        return this.getDomainResponse('beach_tourism', text);
      }
    }
    
    if (this.generalPatterns.what_questions.some(p => p.test(text))) {
      if (text.includes('tsunami') || text.includes('wave') || text.includes('current') || 
          text.includes('flood') || text.includes('storm') || text.includes('erosion')) {
        return this.getDomainResponse('ocean_hazards', text);
      }
      if (text.includes('beach') || text.includes('swim') || text.includes('surf')) {
        return this.getDomainResponse('beach_tourism', text);
      }
      if (text.includes('marine') || text.includes('coral') || text.includes('fish')) {
        return this.getDomainResponse('marine_life', text);
      }
    }
    
    // Analyze domain relevance with weighted scoring
    const domainScores = this.analyzeDomains(text);
    const topDomain = this.getTopDomain(domainScores);
    
    if (topDomain && domainScores[topDomain] > 0.2) {
      this.context.currentTopic = topDomain;
      return this.getDomainResponse(topDomain, text);
    }
    
    // Follow-up question based on context
    if (this.context.currentTopic) {
      return this.getContextualFollowUp();
    }
    
    // If we still don't have a match, try to extract the main topic
    const extractedTopic = this.extractTopic(text);
    if (extractedTopic) {
      return this.getResponseForTopic(extractedTopic, text);
    }
    
    // Default response for ambiguous queries
    return this.getDefaultResponse();
  }

  // Extract topic from text using keyword matching
  extractTopic(text) {
    const topics = {
      tsunami: /tsunami|tidal wave|seismic wave/i,
      flood: /flood|flooding|inundation|high water/i,
      wave: /wave|high wave|big wave|rogue wave|sneaker wave/i,
      current: /current|rip current|undertow|strong current/i,
      storm: /storm|cyclone|hurricane|typhoon/i,
      erosion: /erosion|beach erosion|coastal erosion/i,
      pollution: /pollution|oil spill|contamination|marine debris/i,
      earthquake: /earthquake|seismic|tremor/i,
      beach: /beach|coast|shore|seaside/i,
      marine: /marine|ocean|sea/i,
      weather: /weather|climate|forecast/i,
      safety: /safety|danger|risk|hazard/i,
      technology: /technology|tech|innovation|device/i,
      community: /community|village|town|people/i
    };
    
    for (const [topic, pattern] of Object.entries(topics)) {
      if (pattern.test(text)) {
        return topic;
      }
    }
    
    return null;
  }

  // Get response based on extracted topic
  getResponseForTopic(topic, text) {
    const responses = {
      tsunami: "🚨 **Tsunami Safety**: If you feel strong shaking near coast, move immediately to high ground. Tsunamis can travel at jet speeds (800 km/h) in deep water. Never wait for official warnings if you feel strong shaking. INCOIS issues alerts within 10-20 minutes of undersea earthquakes.",
      flood: "⚠️ **Coastal Flooding**: Avoid flood waters - just 15cm can sweep you off your feet. Monitor tide charts, weather forecasts, and INCOIS alerts. Know your evacuation routes and safe zones. Urban coastal flooding is increasing due to sea-level rise.",
      wave: "🌊 **Wave Safety**: Never turn your back to the ocean. Watch waves for 15+ minutes before entering water. If waves break above waist height, stay out. Rogue waves can occur even in calm conditions. Check INCOIS wave forecasts before beach activities.",
      current: "💨 **Rip Currents**: If caught, stay calm and float. Don't fight the current. Swim parallel to shore to escape, then swim inward. Rip currents account for 80% of beach rescues. Look for choppy, discolored water moving seaward.",
      storm: "⛈️ **Coastal Storms**: Monitor IMD and INCOIS forecasts. Secure outdoor items, avoid beach areas, prepare emergency kit with 3+ days supplies. Know your evacuation zone and route. Cyclone shelters are available in vulnerable areas.",
      erosion: "🏖️ **Beach Erosion**: Avoid unstable cliffs. Stay on marked paths. Erosion accelerates during storms and high tides. Nearly 40% of India's coastline faces erosion issues. Coastal regulation zones help manage development.",
      pollution: "🛢️ **Water Pollution**: Check beach advisory notices. Avoid swimming after heavy rains due to runoff pollution. Report pollution incidents to authorities. Plastic pollution harms marine life and ecosystems.",
      earthquake: "📳 **Coastal Earthquakes**: If you feel strong shaking near coast, immediately move to high ground. Tsunamis can arrive within minutes. Drop, cover, and hold on during shaking. After shaking stops, move inland and uphill.",
      beach: "🏖️ **Beach Safety**: Always check weather, tides, and warning flags. Swim near lifeguards. Protect yourself from sun exposure. Respect local regulations and marine life. Avoid littering and damaging coral reefs.",
      marine: "🐠 **Marine Environment**: India's coastal waters host diverse ecosystems including coral reefs, mangroves, seagrass beds, and countless marine species. These ecosystems face threats from pollution, climate change, and overfishing.",
      weather: "⛅ **Weather Patterns**: India's climate is dominated by the Southwest (June-Sept) and Northeast (Oct-Dec) monsoons. These bring rainfall but also rough seas and coastal hazards. Check IMD and INCOIS forecasts regularly.",
      safety: "⚠️ **Ocean Safety**: Always respect the power of the ocean. Check conditions before entering water, never swim alone, and learn to recognize hazards like rip currents and sneaker waves. Follow local warnings and advisories.",
      technology: "📡 **Marine Technology**: INCOIS uses tsunami buoys, seismic sensors, satellite systems, and coastal radars to detect ocean hazards early. Real-time data helps issue timely warnings to protect coastal communities.",
      community: "🏘️ **Coastal Communities**: Over 40% of India's population lives in coastal areas, relying on marine resources for livelihoods. These communities face unique challenges from climate change, coastal erosion, and natural hazards."
    };
    
    return responses[topic] || this.getDefaultResponse();
  }

  // Enhanced domain response method with better pattern matching
  getDomainResponse(domain, text) {
    const responses = this.domains[domain].responses;
    
    // Enhanced intent matching with better pattern recognition
    if (domain === 'ocean_hazards') {
      if (/(tsunami|tidal wave|seismic wave)/i.test(text)) return responses.tsunami;
      if (/(flood|flooding|inundation|high water)/i.test(text)) return responses.flood;
      if (/(wave|high wave|big wave|rogue wave|sneaker wave)/i.test(text)) return responses.wave;
      if (/(current|rip current|undertow|strong current)/i.test(text)) return responses.current;
      if (/(storm|cyclone|hurricane|typhoon)/i.test(text)) return responses.storm;
      if (/(erosion|beach erosion|coastal erosion)/i.test(text)) return responses.erosion;
      if (/(pollution|oil spill|contamination|marine debris)/i.test(text)) return responses.pollution;
      if (/(earthquake|seismic|tremor)/i.test(text)) return responses.earthquake;
    }
    
    // Add matching for other domains
    if (domain === 'beach_tourism') {
      if (/(safety|safe|danger|warning|risk)/i.test(text)) return responses.safety;
      if (/(plan|planning|trip|vacation|itinerary)/i.test(text)) return responses.planning;
      if (/(conserve|conservation|environment|wildlife|eco)/i.test(text)) return responses.conservation;
    }
    
    if (domain === 'coastal_communities') {
      if (/(resilience|prepare|preparedness|evacuation|recovery)/i.test(text)) return responses.resilience;
      if (/(economy|economic|income|job|livelihood|employment)/i.test(text)) return responses.economy;
    }
    
    if (domain === 'marine_tech') {
      if (/(monitor|monitoring|detect|detection|sensor)/i.test(text)) return responses.monitoring;
      if (/(warning|alert|early warning|notification)/i.test(text)) return responses.warning;
      if (/(innovation|drone|ai|satellite|technology)/i.test(text)) return responses.innovation;
    }
    
    if (domain === 'sea_routes') {
      if (/(safety|safe|navigation|hazard|danger)/i.test(text)) return responses.safety;
      if (/(commerce|trade|transport|cargo|shipping)/i.test(text)) return responses.commerce;
    }
    
    if (domain === 'disaster_management') {
      if (/(prepare|preparedness|plan|planning|ready)/i.test(text)) return responses.preparation;
      if (/(response|respond|emergency|rescue|aid)/i.test(text)) return responses.response;
      if (/(recovery|rebuild|rebuilding|restore|reconstruct)/i.test(text)) return responses.recovery;
    }
    
    if (domain === 'marine_life') {
      if (/(conserve|conservation|protect|preserve|sustain)/i.test(text)) return responses.conservation;
      if (/(threat|danger|risk|problem|issue)/i.test(text)) return responses.threats;
    }
    
    if (domain === 'weather_patterns') {
      if (/(monsoon|rain|rainfall|season)/i.test(text)) return responses.monsoon;
      if (/(climate|change|warming|temperature)/i.test(text)) return responses.climate;
      if (/(forecast|predict|weather|report)/i.test(text)) return responses.forecasting;
    }
    
    return responses.default || "I can help with that topic. Could you provide more specific details about what you'd like to know?";
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
    
    return highestScore > 0.2 ? topDomain : null;
  }

  // Check if query is off-topic
  isOffTopic(text) {
    return this.offTopicPatterns.some(pattern => pattern.test(text));
  }

  getContextualFollowUp() {
    const followUps = {
      ocean_hazards: "Would you like more specific information about preparing for this type of ocean hazard, or would you like current INCOIS data?",
      beach_tourism: "Do you need information about safe practices, destination planning, or current beach conditions?",
      coastal_communities: "Are you interested in community resilience, economic aspects, or cultural heritage of coastal communities?",
      marine_tech: "Would you like information about monitoring systems, warning technology, or recent innovations in ocean observation?",
      sea_routes: "Are you concerned about navigation safety, maritime hazards, or commercial shipping aspects?",
      disaster_management: "Do you need information about preparedness, response strategies, or recovery planning?",
      marine_life: "Would you like to know about marine biodiversity, conservation efforts, or threats to marine ecosystems?",
      weather_patterns: "Are you interested in monsoon patterns, climate change impacts, or weather forecasting methods?"
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