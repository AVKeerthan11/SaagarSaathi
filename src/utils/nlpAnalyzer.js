// nlpAnalyzer.js - Basic keyword detection
class NLPAnalyzer {
  constructor() {
    this.hazardKeywords = {
      highWaves: ['high waves', 'big waves', 'rough sea'],
      flooding: ['flooding', 'water rising', 'inundation'],
      tsunami: ['tsunami', 'tidal wave'],
      erosion: ['beach erosion', 'shoreline erosion']
    };
  }

  // Simple keyword detection
  detectHazard(text) {
    const lowerText = text.toLowerCase();
    
    for (const [hazardType, keywords] of Object.entries(this.hazardKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return {
            type: hazardType,
            confidence: 80, // Basic confidence score
            foundKeyword: keyword
          };
        }
      }
    }
    
    return {
      type: 'none',
      confidence: 0,
      foundKeyword: null
    };
  }
}

export default NLPAnalyzer;