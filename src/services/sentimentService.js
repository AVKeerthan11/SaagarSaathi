// sentimentService.js - Fixed version
class SentimentService {
  constructor() {
    this.sentimentData = {
      positive: 0,
      negative: 0,
      neutral: 0
    };
  }

  // Analyze text and return sentiment
  analyzeSentiment(text) {
    const lowerText = text.toLowerCase();

    let sentiment = 'neutral';
    let confidence = 60;

    if (this.isPositive(lowerText)) {
      sentiment = 'positive';
      confidence = 90;
    } else if (this.isNegative(lowerText)) {
      sentiment = 'negative';
      confidence = 85;
    }

    return {
      sentiment,
      confidence
    };
  }

  isPositive(text) {
    const positiveWords = ['beautiful', 'good', 'nice', 'amazing', 'wonderful', 'great', 'love', 'enjoy'];
    return positiveWords.some(word => text.includes(word));
  }

  isNegative(text) {
    const negativeWords = ['danger', 'warning', 'emergency', 'flood', 'wave', 'erosion', 'storm', 'problem', 'issue'];
    return negativeWords.some(word => text.includes(word));
  }

  // Update overall sentiment statistics
  updateSentimentStats(posts) {
    this.resetStats();
    
    posts.forEach(post => {
      const sentimentResult = typeof post.sentiment === 'string' 
        ? {sentiment: post.sentiment} 
        : post.sentiment;
      const sentiment = sentimentResult.sentiment || this.analyzeSentiment(post.text).sentiment;
      this.sentimentData[sentiment]++;
    });

    return this.getSentimentPercentages();
  }

  resetStats() {
    this.sentimentData = {
      positive: 0,
      negative: 0,
      neutral: 0
    };
  }

  getSentimentPercentages() {
    const total = this.sentimentData.positive + this.sentimentData.negative + this.sentimentData.neutral;
    
    if (total === 0) {
      return {
        positive: 0,
        negative: 0,
        neutral: 0
      };
    }

    return {
      positive: Math.round((this.sentimentData.positive / total) * 100),
      negative: Math.round((this.sentimentData.negative / total) * 100),
      neutral: Math.round((this.sentimentData.neutral / total) * 100)
    };
  }

  // Get raw counts for charts
  getSentimentCounts() {
    return { ...this.sentimentData };
  }
}

// Create singleton instance
const sentimentService = new SentimentService();
export default sentimentService;