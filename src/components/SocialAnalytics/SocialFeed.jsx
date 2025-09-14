import React, { useState, useEffect, useCallback } from 'react';
import realTimeService from '../../services/realTimeService';
import analyticsService from '../../services/analyticsService';
import AnalyticsCharts from './AnalyticsCharts';
import './SocialFeed.css';
import sentimentService from '../../services/sentimentService';

const SocialFeed = () => {
  const [posts, setPosts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  const handleNewPost = useCallback((newPost) => {
    setPosts(prevPosts => {
      const updatedPosts = [newPost, ...prevPosts];
      // Keep only latest 20 posts
      return updatedPosts.length > 20 ? updatedPosts.slice(0, 20) : updatedPosts;
    });
  }, []);

  // Update analytics when posts change
  useEffect(() => {
    const newAnalytics = analyticsService.analyzePosts(posts);
    setAnalyticsData(newAnalytics);
  }, [posts]);

  const handleConnected = useCallback(() => {
    setIsConnected(true);
  }, []);

  const handleDisconnected = useCallback(() => {
    setIsConnected(false);
  }, []);

  useEffect(() => {
    realTimeService.on('new_social_post', handleNewPost);
    realTimeService.on('connected', handleConnected);
    realTimeService.on('disconnected', handleDisconnected);

    realTimeService.connect();

    return () => {
      realTimeService.disconnect();
    };
  }, [handleNewPost, handleConnected, handleDisconnected]);

  const getHazardColor = (type) => {
    const colors = {
      highWaves: '#007bff',
      flooding: '#28a745', 
      storm: '#dc3545',
      erosion: '#ffc107',
      other: '#6c757d'
    };
    return colors[type] || '#6c757d';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-IN');
  };

  const exportData = () => {
    analyticsService.exportToCSV(posts);
  };

  return (
    <div className="social-feed">
      <div className="feed-header">
        <h3>🌊 Social Media Monitoring</h3>
        <div className="header-controls">
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            {isConnected ? 'Live' : 'Offline'}
          </div>
          <button onClick={exportData} className="export-btn">
            <i className="fas fa-download"></i> Export CSV
          </button>
        </div>
      </div>

      {/* Analytics Charts */}
      <AnalyticsCharts analyticsData={analyticsData} />

      {/* Posts List */}
      <div className="posts-container">
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>Waiting for social media posts...</p>
            <small>New posts will appear here automatically</small>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="social-post" 
                 style={{ borderLeft: `4px solid ${getHazardColor(post.analysis.hazardType)}` }}>
              <div className="post-header">
                <span className="platform-badge">{post.platform}</span>
                <span className="post-time">{formatTime(post.timestamp)}</span>
              </div>
              
              <p className="post-text">{post.text}</p>
              
              <div className="post-analysis">
                <span className={`hazard-tag ${post.analysis.hazardType}`}>
                  {post.analysis.hazardType}
                </span>
                <span className="confidence">
  {post.analysis && post.analysis.confidence
    ? `${post.analysis.confidence}% confidence`
    : 'Confidence data not available'}
</span>

              </div>
              
              <div className="post-meta">
                <span className="user">@{post.user}</span>
                <span className="location">📍 {post.location}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SocialFeed;