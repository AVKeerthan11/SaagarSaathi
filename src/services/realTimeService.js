// Simple SocialDataGenerator without advanced NLP
import sentimentService from './sentimentService';

class SocialDataGenerator {
  constructor() {
    this.locations = [
      { name: 'Mumbai Beach', lat: 19.0760, lng: 72.8777 },
      { name: 'Goa Beach', lat: 15.2993, lng: 74.1240 },
      { name: 'Chennai Marina', lat: 13.0827, lng: 80.2707 },
      { name: 'Puri Beach', lat: 19.8135, lng: 85.8312 },
      { name: 'Kovalam Beach', lat: 8.3661, lng: 76.9969 }
    ];
    this.platforms = ['twitter', 'reddit', 'facebook'];
    this.users = ['beach_lover', 'wave_watcher', 'coastal_guard', 'surfer_dude', 'marine_observer'];
  }

  generatePost() {
    const templates = [
      "Big waves at {location} right now! Stay safe everyone. #highwaves",
      "Water levels rising in {location} area. Be careful if you're nearby.",
      "Unusual water movement at {location}. Could this be something serious?",
      "Beach erosion at {location} is getting worse after last night's storm.",
      "Beautiful day at {location} beach today! Perfect for swimming. 🌊",
      "Warning: Strong currents reported at {location}. Avoid swimming today.",
      "Coastal flooding alert for {location} area. Authorities monitoring situation.",
      "Pollution spotted near {location}. Water doesn't look safe today.",
      "Massive storm approaching {location}. Everyone should take precautions.",
      "Tsunami warning drill happening at {location} today. Don't be alarmed!"
    ];
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    const locationObj = this.locations[Math.floor(Math.random() * this.locations.length)];
    const platform = this.platforms[Math.floor(Math.random() * this.platforms.length)];
    const user = this.users[Math.floor(Math.random() * this.users.length)];

    const text = template.replace('{location}', locationObj.name);
    const sentimentResult = sentimentService.analyzeSentiment(text);
    
    return {
      id: Date.now() + Math.random(),
      text: text,
      user: user,
      platform: platform,
      timestamp: new Date(),
      location: locationObj.name,
      coordinates: { lat: locationObj.lat, lng: locationObj.lng },
      sentiment: sentimentResult.sentiment,
      analysis: this.analyzePost(text)
    };
  }

  // Enhanced analysis with better pattern matching
  analyzePost(text) {
    const lowerText = text.toLowerCase();
    
    if ((lowerText.includes('wave') || lowerText.includes('current')) && 
        (lowerText.includes('big') || lowerText.includes('high') || lowerText.includes('strong'))) {
      return { type: 'highWaves', confidence: Math.floor(Math.random() * 20) + 75 };
    }
    if (lowerText.includes('flood') || lowerText.includes('water level')) {
      return { type: 'flooding', confidence: Math.floor(Math.random() * 20) + 70 };
    }
    if (lowerText.includes('erosion') || lowerText.includes('beach erosion')) {
      return { type: 'erosion', confidence: Math.floor(Math.random() * 20) + 80 };
    }
    if (lowerText.includes('storm') || lowerText.includes('warning')) {
      return { type: 'storm', confidence: Math.floor(Math.random() * 20) + 85 };
    }
    if (lowerText.includes('tsunami')) {
      return { type: 'tsunami', confidence: Math.floor(Math.random() * 15) + 80 };
    }
    if (lowerText.includes('pollution') || lowerText.includes('contamination')) {
      return { type: 'pollution', confidence: Math.floor(Math.random() * 25) + 65 };
    }
    if (lowerText.includes('beautiful') || lowerText.includes('nice') || lowerText.includes('perfect')) {
      return { type: 'other', confidence: Math.floor(Math.random() * 30) + 40 };
    }
    
    return { type: 'other', confidence: Math.floor(Math.random() * 30) + 30 };
  }
}

// RealTimeService class
class RealTimeService {
  constructor() {
    this.isConnected = false;
    this.callbacks = [];
    this.intervalId = null;
    this.dataGenerator = new SocialDataGenerator();
  }

  connect() {
    console.log('🔌 Connecting to real-time social media monitoring...');
    
    setTimeout(() => {
      this.isConnected = true;
      console.log('✅ Connected to real-time service');
      this.notifyCallbacks('connected');
      this.startSimulatedDataStream();
    }, 1500);
  }

  disconnect() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isConnected = false;
    console.log('❌ Disconnected from real-time service');
    this.notifyCallbacks('disconnected');
  }

  on(event, callback) {
    this.callbacks.push({ event, callback });
  }

  notifyCallbacks(event, data) {
    this.callbacks.forEach((cb) => {
      if (cb.event === event) {
        cb.callback(data);
      }
    });
  }

  startSimulatedDataStream() {
    console.log('Starting simulated data stream...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    // Generate initial posts
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        if (this.isConnected) {
          const newPost = this.dataGenerator.generatePost();
          this.notifyCallbacks('new_social_post', newPost);
        }
      }, i * 1000);
    }
    
    // Continue generating posts at random intervals
    this.intervalId = setInterval(() => {
      if (this.isConnected) {
        const newPost = this.dataGenerator.generatePost();
        console.log('📨 New social post:', newPost.text);
        this.notifyCallbacks('new_social_post', newPost);
      }
    }, Math.random() * 5000 + 8000); // 8-13 seconds between posts
  }
}

const realTimeService = new RealTimeService();
export default realTimeService;