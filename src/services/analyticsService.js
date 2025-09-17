// Analytics service for advanced metrics
class AnalyticsService {
  constructor() {
    this.sentimentData = [];
    this.hazardDistribution = {};
    this.confidenceMetrics = [];
  }

  // Analyze multiple posts for overall metrics
  analyzePosts(posts) {
    const hazardPosts = posts.filter(post => post.analysis.hazardType !== 'other');
    
    return {
      totalPosts: posts.length,
      hazardPosts: hazardPosts.length,
      sentiment: this.calculateSentimentDistribution(posts),
      hazardDistribution: this.calculateHazardDistribution(hazardPosts),
      confidence: this.calculateConfidenceMetrics(hazardPosts),
      timeline: this.generateTimelineData(posts)
    };
  }

  calculateSentimentDistribution(posts) {
    const sentiments = {
      positive: 0,
      negative: 0,
      neutral: 0
    };

    posts.forEach(post => {
      // Simple sentiment detection
      const text = post.text.toLowerCase();
      if (text.includes('beautiful') || text.includes('good') || text.includes('nice')) {
        sentiments.positive++;
      } else if (text.includes('danger') || text.includes('warning') || text.includes('emergency')) {
        sentiments.negative++;
      } else {
        sentiments.neutral++;
      }
    });

    return sentiments;
  }

  calculateHazardDistribution(posts) {
    const distribution = {};
    
    posts.forEach(post => {
      const type = post.analysis.hazardType;
      distribution[type] = (distribution[type] || 0) + 1;
    });

    return distribution;
  }

  calculateConfidenceMetrics(posts) {
    if (posts.length === 0) return { average: 0, min: 0, max: 0 };
    
    const confidences = posts.map(post => post.analysis.confidence);
    return {
      average: Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length),
      min: Math.min(...confidences),
      max: Math.max(...confidences)
    };
  }

  generateTimelineData(posts) {
    // Last 7 days of data
    const days = 7;
    const timeline = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-IN');
      
      const dayPosts = posts.filter(post => {
        const postDate = new Date(post.timestamp).toLocaleDateString('en-IN');
        return postDate === dateStr;
      });

      timeline.push({
        date: dateStr,
        count: dayPosts.length,
        hazardCount: dayPosts.filter(p => p.analysis.hazardType !== 'other').length
      });
    }

    return timeline;
  }

  // Export data as CSV
  exportToCSV(posts, filename = 'social_analytics.csv') {
    const headers = ['Date', 'Platform', 'Hazard Type', 'Confidence', 'Text', 'Location'];
    const csvData = posts.map(post => [
      new Date(post.timestamp).toLocaleString('en-IN'),
      post.platform,
      post.analysis.hazardType,
      post.analysis.confidence + '%',
      `"${post.text.replace(/"/g, '""')}"`, // Escape quotes for CSV
      post.location
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;