// Simple SocialDataGenerator without advanced NLP
import sentimentService from './sentimentService';

class SocialDataGenerator {
  constructor() {
    this.locations = ['Mumbai Beach', 'Goa', 'Chennai Marina', 'Puri Beach', 'Kovalam'];
    this.platforms = ['twitter', 'reddit', 'facebook'];
    this.users = ['user1', 'user2', 'user3', 'user4', 'user5'];
    this.hazardKeywords = {
      highWaves: ['wave', 'high tide', 'swell'],
      flooding: ['flood', 'water level', 'rising'],
      erosion: ['erosion', 'disappearing beach'],
      storm: ['storm', 'cyclone', 'warning']
    };
  }

  generatePost() {
    const templates = [
      "Big waves at {location} right now!",
      "Water levels rising in {location} area",
      "Unusual water movement at {location}",
      "Beach erosion at {location}",
      "Beautiful day at {location} beach today!"
    ];
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    const location = this.locations[Math.floor(Math.random() * this.locations.length)];
    const platform = this.platforms[Math.floor(Math.random() * this.platforms.length)];
    const user = this.users[Math.floor(Math.random() * this.users.length)];

    const text = template.replace('{location}', location);
    
    return {
      id: Date.now() + Math.random(),
      text: text,
      user: user,
      platform: platform,
      timestamp: new Date(),
      location: location
    };
  }

  // Simple analysis without advanced NLP, now returning type and confidence
  analyzePost(text) {
    const lowerText = text.toLowerCase();
    let hazardType = 'other';
    let confidence = 30;

    if (this.hazardKeywords.highWaves.some(keyword => lowerText.includes(keyword))) {
      hazardType = 'highWaves';
      confidence = 75;
    } else if (this.hazardKeywords.flooding.some(keyword => lowerText.includes(keyword))) {
      hazardType = 'flooding';
      confidence = 80;
    } else if (this.hazardKeywords.erosion.some(keyword => lowerText.includes(keyword))) {
      hazardType = 'erosion';
      confidence = 85;
    } else if (this.hazardKeywords.storm.some(keyword => lowerText.includes(keyword))) {
      hazardType = 'storm';
      confidence = 70;
    }
    
    return { hazardType, confidence };
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
    
    this.intervalId = setInterval(() => {
      if (this.isConnected) {
        const newPost = this.dataGenerator.generatePost();
        
        // Perform both analyses
        const basicAnalysis = this.dataGenerator.analyzePost(newPost.text);
        const sentimentResult = sentimentService.analyzeSentiment(newPost.text);
        
        // Combine analyses into a single object
        const analysis = {
          ...basicAnalysis, // Includes hazardType and confidence
          sentiment: sentimentResult.sentiment,
          // You can decide to use sentiment confidence or hazard confidence
          // For now, let's use the one from the hazard analysis
          // confidence: basicAnalysis.confidence 
        };
        
        const postWithAnalysis = {
          ...newPost,
          analysis: analysis
        };
        
        console.log('📨 New social post:', newPost.text);
        this.notifyCallbacks('new_social_post', postWithAnalysis);
      }
    }, Math.random() * 5000 + 15000);
  }
}

const realTimeService = new RealTimeService();
export default realTimeService;