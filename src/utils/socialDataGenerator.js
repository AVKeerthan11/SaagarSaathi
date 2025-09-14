class SocialDataGenerator {
  constructor() {
    this.locations = ['Santa Monica', 'Miami', 'Venice Beach', 'San Diego', 'Costa Rica', 
                     'Bali', 'Sydney', 'Rio de Janeiro', 'Mumbai', 'Tokyo', 'Hawaii',
                     'Phuket', 'Barcelona', 'San Francisco', ' Vancouver'];
    this.platforms = ['twitter', 'reddit', 'facebook', 'instagram'];
    this.users = [
      'beach_lover', 'wave_watcher', 'coastal_guard', 'surfer_dude', 'weather_alert',
      'ocean_observer', 'coastal_resident', 'marine_watcher', 'tide_tracker', 'storm_chaser',
      'beachcomber_amy', 'surf_pro_mike', 'sandy_toes', 'salty_dog', 'coastal_carl',
      'wave_rider', 'tidal_watcher', 'shoreline_sam', 'beach_bum', 'coastal_claire',
      'surf_guru', 'ocean_wise', 'coastal_dave', 'wave_runner', 'beach_life'
    ];
    this.lastUsedUsers = []; // Track recently used users
  }

  generatePost() {
    const templates = [
      "Big waves at {location} right now! #highwaves 🌊",
      "Coastal flooding warning in {location} area. Water levels rising rapidly. ⚠️",
      "Unusual water movement at {location}. Is this normal?",
      "Beach erosion getting serious at {location}. 🏖️",
      "Beautiful day at {location} beach today! ☀️",
      "Saw some interesting wave patterns at {location}",
      "Water looking rough near {location} today",
      "Lifeguards issuing warnings at {location} beach",
      "High tide causing issues at {location}",
      "Storm warnings for {location} coastal areas",
      "Amazing sunset at {location} with calm waters 🌅",
      "Strong currents reported at {location}, be careful!",
      "Coastal cleanup needed at {location} due to debris",
      "Dolphin spotting at {location} today! 🐬",
      "Water temperature feels great at {location}"
    ];
    
    const template = templates[Math.floor(Math.random() * templates.length)];
    const location = this.locations[Math.floor(Math.random() * this.locations.length)];
    const platform = this.platforms[Math.floor(Math.random() * this.platforms.length)];
    
    // Get a user that hasn't been used recently
    const user = this.getRandomUser();
    
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

  // Get a random user, avoiding recent repeats
  getRandomUser() {
    const availableUsers = this.users.filter(user => !this.lastUsedUsers.includes(user));
    const userPool = availableUsers.length > 0 ? availableUsers : this.users;
    const user = userPool[Math.floor(Math.random() * userPool.length)];
    
    // Update recently used users (keep last 5)
    this.lastUsedUsers.push(user);
    if (this.lastUsedUsers.length > 5) {
      this.lastUsedUsers.shift(); // Remove oldest
    }
    
    return user;
  }

  analyzePost(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('wave') && (lowerText.includes('big') || lowerText.includes('high'))) {
      return { type: 'highWaves', confidence: Math.floor(Math.random() * 20) + 75 }; // 75-95%
    }
    if (lowerText.includes('flood')) {
      return { type: 'flooding', confidence: Math.floor(Math.random() * 20) + 75 };
    }
    if (lowerText.includes('erosion')) {
      return { type: 'erosion', confidence: Math.floor(Math.random() * 20) + 75 };
    }
    if (lowerText.includes('storm') || lowerText.includes('warning')) {
      return { type: 'storm', confidence: Math.floor(Math.random() * 20) + 70 };
    }
    if (lowerText.includes('current') && lowerText.includes('strong')) {
      return { type: 'strongCurrents', confidence: Math.floor(Math.random() * 20) + 70 };
    }
    
    return { type: 'other', confidence: Math.floor(Math.random() * 40) + 30 }; // 30-70%
  }
}