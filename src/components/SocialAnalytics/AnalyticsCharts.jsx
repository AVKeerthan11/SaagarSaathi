import React from 'react';
import './AnalyticsCharts.css';

const AnalyticsCharts = ({ analyticsData }) => {
  if (!analyticsData || analyticsData.hazardPosts === 0) {
    return (
      <div className="analytics-placeholder">
        <h4>📊 Analytics Overview</h4>
        <p>No hazard data available yet. Social media posts will appear here soon.</p>
      </div>
    );
  }

  const { sentiment, hazardDistribution, confidence, timeline } = analyticsData;

  return (
    <div className="analytics-charts">
      <h4>📊 Advanced Analytics</h4>
      
      <div className="charts-grid">
        {/* Sentiment Chart */}
        <div className="chart-card">
          <h5>Sentiment Analysis</h5>
          <div className="sentiment-chart">
            <div className="sentiment-bar positive" 
                 style={{ width: `${(sentiment.positive / analyticsData.totalPosts) * 100}%` }}>
              <span>Positive: {sentiment.positive}</span>
            </div>
            <div className="sentiment-bar neutral" 
                 style={{ width: `${(sentiment.neutral / analyticsData.totalPosts) * 100}%` }}>
              <span>Neutral: {sentiment.neutral}</span>
            </div>
            <div className="sentiment-bar negative" 
                 style={{ width: `${(sentiment.negative / analyticsData.totalPosts) * 100}%` }}>
              <span>Negative: {sentiment.negative}</span>
            </div>
          </div>
        </div>

        {/* Hazard Distribution */}
        <div className="chart-card">
          <h5>Hazard Distribution</h5>
          <div className="hazard-distribution">
            {Object.entries(hazardDistribution).map(([type, count]) => (
              <div key={type} className="hazard-item">
                <span className="hazard-label">{type}</span>
                <div className="hazard-bar-container">
                  <div 
                    className="hazard-bar" 
                    style={{ 
                      width: `${(count / analyticsData.hazardPosts) * 100}%`,
                      backgroundColor: getHazardColor(type)
                    }}
                  ></div>
                </div>
                <span className="hazard-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Confidence Metrics */}
        <div className="chart-card">
          <h5>Confidence Metrics</h5>
          <div className="confidence-metrics">
            <div className="metric">
              <span className="metric-label">Average</span>
              <span className="metric-value">{confidence.average}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Minimum</span>
              <span className="metric-value">{confidence.min}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Maximum</span>
              <span className="metric-value">{confidence.max}%</span>
            </div>
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="chart-card timeline-card">
          <h5>Posts Timeline (7 days)</h5>
          <div className="timeline-chart">
            {timeline.map((day, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-date">{day.date}</div>
                <div className="timeline-bars">
                  <div 
                    className="timeline-bar total" 
                    style={{ height: `${(day.count / Math.max(...timeline.map(t => t.count))) * 50}px` }}
                    title={`Total: ${day.count}`}
                  ></div>
                  <div 
                    className="timeline-bar hazard" 
                    style={{ height: `${(day.hazardCount / Math.max(...timeline.map(t => t.hazardCount || 1))) * 50}px` }}
                    title={`Hazard: ${day.hazardCount}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for hazard colors
const getHazardColor = (type) => {
  const colors = {
    highWaves: '#007bff',
    flooding: '#28a745',
    erosion: '#ffc107',
    storm: '#dc3545',
    other: '#6c757d'
  };
  return colors[type] || '#6c757d';
};

export default AnalyticsCharts;