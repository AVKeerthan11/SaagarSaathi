import React, { useState, useEffect } from 'react';
import './OceanWatch.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SocialFeed from './components/SocialAnalytics/SocialFeed';
import sentimentService from './services/sentimentService';
import analyticsService from './services/analyticsService';

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
const OceanWatch = () => {
  const [userRole, setUserRole] = useState('citizen'); // citizen, official
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('map'); // Start with map for citizens
  const [reports, setReports] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [socialMediaData, setSocialMediaData] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);

  // Sample data for demonstration
  useEffect(() => {
    const mockReports = [
      {
        id: 1,
        type: 'highWaves',
        description: 'Large waves observed near the pier',
        location: { lat: 17.6868, lng: 83.2185 },
        timestamp: new Date(),
        status: 'new',
        media: [],
        reporter: 'Citizen',
        urgency: 'high'
      },
      {
        id: 2,
        type: 'flooding',
        description: 'Water entering coastal roads',
        location: { lat: 17.7233, lng: 83.3020 },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'verified',
        media: [],
        reporter: 'Official',
        urgency: 'medium'
      },
      {
        id: 3,
        type: 'tsunami',
        description: 'Unusual water recession observed',
        location: { lat: 17.7000, lng: 83.2500 },
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        status: 'new',
        media: [],
        reporter: 'Citizen',
        urgency: 'high'
      }
    ];

    const mockHotspots = [
      { id: 1, location: { lat: 17.6868, lng: 83.2185 }, severity: 'high', reportCount: 5 },
      { id: 2, location: { lat: 17.7233, lng: 83.3020 }, severity: 'medium', reportCount: 3 }
    ];

    const mockSocialMedia = [
      { 
        id: 1, 
        text: 'Huge waves at RK Beach today! #highwaves', 
        sentiment: sentimentService.analyzeSentiment('Huge waves at RK Beach today! #highwaves'),
        location: { lat: 17.6868, lng: 83.2185 }
      },
      { 
        id: 2, 
        text: 'Water level rising near the port area', 
        sentiment: sentimentService.analyzeSentiment('Water level rising near the port area'),
        location: { lat: 17.7233, lng: 83.3020 }
      },
      { 
        id: 3, 
        text: 'Beautiful day at the beach today!', 
        sentiment: sentimentService.analyzeSentiment('Beautiful day at the beach today!'),
        location: { lat: 17.7000, lng: 83.2800 }
      }
    ];
    
    const detectHazardType = (text) => {
      const lowerText = text.toLowerCase();
      if (lowerText.includes('wave')) return 'highWaves';
      if (lowerText.includes('flood')) return 'flooding';
      if (lowerText.includes('erosion')) return 'erosion';
      if (lowerText.includes('storm')) return 'storm';
      return 'other';
    };

    // After definition, map to add 'confidence' and 'analysis' fields for each post
    const enrichedSocialMedia = mockSocialMedia.map(post => {
      const sentimentResult = post.sentiment; // now an object {sentiment, confidence}
      return {
        ...post,
        sentiment: sentimentResult.sentiment,
        confidence: sentimentResult.confidence,
        analysis: {
          hazardType: detectHazardType(post.text), // create or import a hazard detection function
          confidence: sentimentResult.confidence
        }
      };
    });

    setSocialMediaData(enrichedSocialMedia);
    setReports(mockReports);
    setHotspots(mockHotspots);
  }, []);

  // If official role selected but not logged in, show login
  if (userRole === 'official' && !isLoggedIn) {
    return <LoginScreen setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />;
  }

  return (
    <div className="oceanwatch-app">
      <Header 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        userRole={userRole}
        setUserRole={setUserRole}
        setIsLoggedIn={setIsLoggedIn}
      />
      
      <div className="main-content">
        {currentView === 'dashboard' && userRole === 'official' && (
          <Dashboard 
            reports={reports}
            hotspots={hotspots}
            socialMediaData={socialMediaData}
          />
        )}
        
        {currentView === 'recent-reports' && userRole === 'citizen' && (
          <RecentReports reports={reports} />
        )}
        
        {currentView === 'report' && userRole === 'citizen' && (
          <ReportForm 
            userRole={userRole}
            setCurrentView={setCurrentView}
          />
        )}
        
        {currentView === 'analytics' && userRole === 'official' && (
          <AnalyticsDashboard 
            reports={reports}
            socialMediaData={socialMediaData}
            hotspots={hotspots}
          />
        )}
        
        {currentView === 'map' && (
          <InteractiveMap 
            reports={reports}
            hotspots={hotspots}
            socialMediaData={socialMediaData}
          />
        )}
      </div>

      {/* Floating Chatbot for Citizens */}
      {userRole === 'citizen' && showChatbot && (
        <FloatingChatbot onClose={() => setShowChatbot(false)} />
      )}
      
      {/* Chatbot Button for Citizens */}
      {userRole === 'citizen' && !showChatbot && (
        <button 
          className="floating-chatbot-btn"
          onClick={() => setShowChatbot(true)}
        >
          🤖 Chat
        </button>
      )}
    </div>
  );
};

// Floating Chatbot Component
const FloatingChatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm your Ocean Hazard Assistant. Ask me about ocean hazards 🌊" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    
    let reply = "I'm still learning about ocean hazards. For accurate information, please consult official sources.";
    
    if (input.toLowerCase().includes("tsunami")) {
      reply = "🚨 In case of tsunami warning: Move to higher ground immediately. Follow official evacuation routes.";
    } else if (input.toLowerCase().includes("wave") || input.toLowerCase().includes("high surf")) {
      reply = "High waves can be dangerous. Avoid beach activities during high surf advisories.";
    } else if (input.toLowerCase().includes("flood")) {
      reply = "During coastal flooding: Avoid walking or driving through flood waters.";
    } else if (input.toLowerCase().includes("current")) {
      reply = "If caught in a rip current: Don't fight it. Swim parallel to shore to escape.";
    } else if (input.toLowerCase().includes("storm")) {
      reply = "During ocean storms: Stay indoors away from windows. Avoid beach areas.";
    } else if (input.toLowerCase().includes("report")) {
      reply = "You can report hazards using the 'Report Hazard' option in the main menu.";
    }
    
    setMessages([...messages, { from: "user", text: input }, { from: "bot", text: reply }]);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="floating-chatbot">
      <div className="chatbot-header">
        <h3>🤖 Hazard Assistant</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      
      <div className="chatbot-messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.from}`}>
            {m.text}
          </div>
        ))}
      </div>
      
      <div className="chatbot-input">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about ocean hazards..." 
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

// Login Screen Component
const LoginScreen = ({ setIsLoggedIn, setUserRole }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Demo credentials
    if (credentials.username === 'official' && credentials.password === 'admin123') {
      setIsLoggedIn(true);
    } else {
      setLoginError('Invalid credentials. Use username: official, password: admin123');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <i className="fas fa-water"></i>
            <h1>OceanWatch</h1>
          </div>
          <h2>Official Login</h2>
          <p>Enter your credentials to access the official dashboard</p>
        </div>
        
        <div className="login-form">
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              placeholder="Enter your password"
              required
            />
          </div>
          
          {loginError && <div className="error-message">{loginError}</div>}
          
          <button type="button" onClick={handleLogin} className="login-btn">
            <i className="fas fa-sign-in-alt"></i> Login
          </button>
        </div>
        
        <div className="login-footer">
          <button 
            className="switch-to-citizen"
            onClick={() => setUserRole('citizen')}
          >
            Continue as Citizen
          </button>
        </div>
      </div>
    </div>
  );
};

// Header Component
const Header = ({ currentView, setCurrentView, userRole, setUserRole, setIsLoggedIn }) => {
  const handleRoleSwitch = (role) => {
    setUserRole(role);
    if (role === 'citizen') {
      setCurrentView('map');
      setIsLoggedIn(false);
    } else if (role === 'official') {
      setIsLoggedIn(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('citizen');
    setCurrentView('map');
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo">
          <i className="fas fa-water"></i>
          <h1>OceanWatch</h1>
          <span className="role-badge">{userRole}</span>
        </div>
        
        <nav className="main-nav">
          {userRole === 'citizen' ? (
            <>
              <button 
                className={currentView === 'map' ? 'active' : ''}
                onClick={() => setCurrentView('map')}
              >
                <i className="fas fa-map-marked-alt"></i> Interactive Map
              </button>
              
              <button 
                className={currentView === 'report' ? 'active' : ''}
                onClick={() => setCurrentView('report')}
              >
                <i className="fas fa-plus-circle"></i> Report Hazard
              </button>
              
              <button 
                className={currentView === 'recent-reports' ? 'active' : ''}
                onClick={() => setCurrentView('recent-reports')}
              >
                <i className="fas fa-list"></i> Recent Reports
              </button>
            </>
          ) : (
            <>
              <button 
                className={currentView === 'dashboard' ? 'active' : ''}
                onClick={() => setCurrentView('dashboard')}
              >
                <i className="fas fa-home"></i> Dashboard
              </button>
              
              <button 
                className={currentView === 'map' ? 'active' : ''}
                onClick={() => setCurrentView('map')}
              >
                <i className="fas fa-map-marked-alt"></i> Interactive Map
              </button>
              
              <button 
                className={currentView === 'analytics' ? 'active' : ''}
                onClick={() => setCurrentView('analytics')}
              >
                <i className="fas fa-chart-line"></i> Analytics
              </button>
            </>
          )}
        </nav>
        
        <div className="user-controls">
          <div className="role-selector">
            <select 
              value={userRole} 
              onChange={(e) => handleRoleSwitch(e.target.value)}
            >
              <option value="citizen">Citizen</option>
              <option value="official">Official</option>
            </select>
          </div>
          
          {userRole === 'official' && (
            <button className="logout-btn" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

// Recent Reports Component (for Citizens)
const RecentReports = ({ reports }) => {
  const recentReports = reports.slice(0, 6);

  return (
    <div className="recent-reports">
      <div className="reports-header">
        <h2>Recent Hazard Reports</h2>
        <p>Latest reports from the community</p>
      </div>
      
      <div className="reports-grid">
        {recentReports.map(report => (
          <div key={report.id} className="report-card">
            <div className="report-header">
              <div className="report-icon">
                <i className={`fas ${getReportIcon(report.type)}`}></i>
              </div>
              <div className="report-meta">
                <h3>{formatReportType(report.type)}</h3>
                <span className="report-time">{formatTime(report.timestamp)}</span>
              </div>
              <div className={`urgency-badge ${report.urgency}`}>
                {report.urgency}
              </div>
            </div>
            
            <div className="report-content">
              <p>{report.description}</p>
              <div className="report-location">
                <i className="fas fa-map-marker-alt"></i>
                <span>{report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}</span>
              </div>
            </div>
            
            <div className="report-footer">
              <span className="reporter">Reported by: {report.reporter}</span>
              <span className={`status-badge ${report.status}`}>{report.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Dashboard Component (Officials only)
const Dashboard = ({ reports, hotspots, socialMediaData }) => {
  const recentReports = reports.slice(0, 3);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Official Dashboard</h2>
        <p>Comprehensive ocean hazard monitoring and management</p>
      </div>
      
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="stat-info">
            <h3>{reports.length}</h3>
            <p>Total Reports</p>
            <span className="stat-change positive">+12% from last week</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon red">
            <i className="fas fa-radiation"></i>
          </div>
          <div className="stat-info">
            <h3>{hotspots.length}</h3>
            <p>Active Hotspots</p>
            <span className="stat-change neutral">No change</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon orange">
            <i className="fas fa-comments"></i>
          </div>
          <div className="stat-info">
            <h3>{socialMediaData.length}</h3>
            <p>Social Mentions</p>
            <span className="stat-change positive">+25% today</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon green">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3>{reports.filter(r => r.status === 'verified').length}</h3>
            <p>Verified Reports</p>
            <span className="stat-change positive">+5 today</span>
          </div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {recentReports.map(report => (
              <div key={report.id} className="activity-item">
                <div className="activity-icon">
                  <i className={`fas ${getReportIcon(report.type)}`}></i>
                </div>
                <div className="activity-details">
                  <h4>{formatReportType(report.type)}</h4>
                  <p>{report.description}</p>
                  <span className="activity-time">{formatTime(report.timestamp)}</span>
                </div>
                <div className={`urgency-badge ${report.urgency}`}>
                  {report.urgency}
                </div>
                <button className="action-btn">
                  <i className="fas fa-eye"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-grid">
            <div className="action-item">
              <i className="fas fa-bullhorn"></i>
              <h4>Issue Alert</h4>
              <p>Send emergency notification</p>
            </div>
            <div className="action-item">
              <i className="fas fa-satellite"></i>
              <h4>Satellite Data</h4>
              <p>View latest imagery</p>
            </div>
            <div className="action-item">
              <i className="fas fa-users"></i>
              <h4>Deploy Team</h4>
              <p>Coordinate response</p>
            </div>
            <div className="action-item">
              <i className="fas fa-chart-bar"></i>
              <h4>Generate Report</h4>
              <p>Create summary</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Report Form Component
const ReportForm = ({ userRole, setCurrentView }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    location: null,
    urgency: 'medium',
    media: [],
    satelliteRef: '',
    officialNotes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Report submitted successfully!');
    setCurrentView(userRole === 'citizen' ? 'map' : 'dashboard');
  };

  return (
    <div className="report-form">
      <div className="form-header">
        <h2>Report Ocean Hazard</h2>
        <div className="progress-steps">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            <span>1</span>
            <label>Details</label>
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <span>2</span>
            <label>Location</label>
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <label>Submit</label>
          </div>
        </div>
      </div>
      
      <div className="multi-step-form">
        {currentStep === 1 && (
          <div className="form-step">
            <h3>Hazard Information</h3>
            
            <div className="form-group">
              <label>Type of Hazard *</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleInputChange}
                required
              >
                <option value="">Select a hazard type</option>
                <option value="highWaves">High Waves</option>
                <option value="flooding">Coastal Flooding</option>
                <option value="tsunami">Tsunami Alert</option>
                <option value="erosion">Beach Erosion</option>
                <option value="pollution">Water Pollution</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Description *</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange}
                placeholder="Please describe what you're observing..."
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>Urgency Level *</label>
              <select 
                name="urgency" 
                value={formData.urgency} 
                onChange={handleInputChange}
                required
              >
                <option value="low">Low - No immediate danger</option>
                <option value="medium">Medium - Potential risk</option>
                <option value="high">High - Immediate danger</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-next"
                onClick={() => setCurrentStep(2)}
                disabled={!formData.type || !formData.description}
              >
                Next <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 2 && (
          <div className="form-step">
            <h3>Location Details</h3>
            
            <div className="location-buttons">
              <button type="button" className="location-btn">
                <i className="fas fa-crosshairs"></i>
                Use Current Location
              </button>
              <button type="button" className="location-btn">
                <i className="fas fa-map-pin"></i>
                Select on Map
              </button>
            </div>
            
            <div className="form-group">
              <label>Address or Landmark</label>
              <input 
                type="text" 
                placeholder="Enter address or nearby landmark" 
              />
            </div>
            
            <div className="map-preview">
              <i className="fas fa-map-marked-alt"></i>
              <p>Interactive map will appear here</p>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-prev"
                onClick={() => setCurrentStep(1)}
              >
                <i className="fas fa-arrow-left"></i> Previous
              </button>
              <button 
                type="button" 
                className="btn-next"
                onClick={() => setCurrentStep(3)}
              >
                Next <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        )}
        
        {currentStep === 3 && (
          <div className="form-step">
            <h3>Final Step</h3>
            
            <div className="upload-section">
              <label>Upload Photos or Videos (Optional)</label>
              <div className="upload-area">
                <i className="fas fa-cloud-upload-alt"></i>
                <p>Click to browse or drag files here</p>
                <small>Max file size: 10MB</small>
              </div>
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" required /> 
                I confirm this report is based on my observation
              </label>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-prev"
                onClick={() => setCurrentStep(2)}
              >
                <i className="fas fa-arrow-left"></i> Previous
              </button>
              <button onClick={handleSubmit} className="btn-submit">
                <i className="fas fa-paper-plane"></i> Submit Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Replace the AnalyticsDashboard component in your main file with this:
const AnalyticsDashboard = ({ reports, socialMediaData, hotspots }) => {
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    if (socialMediaData && socialMediaData.length > 0) {
      const data = analyticsService.analyzePosts(socialMediaData);
      setAnalyticsData(data);
    }
  }, [socialMediaData]);

  if (!analyticsData) {
    return (
      <div className="analytics-dashboard">
        <h2>Analytics & Insights</h2>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  const sentimentPercentages = sentimentService.updateSentimentStats(socialMediaData);
  const sentimentCounts = sentimentService.getSentimentCounts();

  return (
    <div className="analytics-dashboard">
      <h2>Analytics & Insights</h2>
      
      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <h3>{reports.length}</h3>
          <p>Total Reports</p>
        </div>
        <div className="stat-card">
          <h3>{analyticsData.hazardPosts}</h3>
          <p>Hazard Mentions</p>
        </div>
        <div className="stat-card">
          <h3>{hotspots.length}</h3>
          <p>Active Hotspots</p>
        </div>
        <div className="stat-card">
          <h3>{analyticsData.totalPosts}</h3>
          <p>Social Posts</p>
        </div>
      </div>
      
      {/* Advanced Analytics Charts */}
      <div className="advanced-analytics-section">
        <h3>Advanced Analytics</h3>
        <div className="charts-grid">
          {/* Sentiment Chart */}
          <div className="chart-card">
            <h4>Sentiment Analysis</h4>
            <div className="chart-container">
              <div className="sentiment-chart">
                <div className="sentiment-bar positive" 
                     style={{ width: `${sentimentPercentages.positive}%` }}>
                  <span>Positive: {sentimentCounts.positive}</span>
                </div>
                <div className="sentiment-bar neutral" 
                     style={{ width: `${sentimentPercentages.neutral}%` }}>
                  <span>Neutral: {sentimentCounts.neutral}</span>
                </div>
                <div className="sentiment-bar negative" 
                     style={{ width: `${sentimentPercentages.negative}%` }}>
                  <span>Negative: {sentimentCounts.negative}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hazard Distribution */}
          <div className="chart-card">
            <h4>Hazard Distribution</h4>
            <div className="chart-container">
              <div className="hazard-distribution">
                {Object.entries(analyticsData.hazardDistribution).map(([type, count]) => (
                  count > 0 && (
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
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Confidence Metrics */}
          <div className="chart-card">
            <h4>Confidence Metrics</h4>
            <div className="confidence-metrics">
              <div className="metric">
                <span className="metric-label">Average</span>
                <span className="metric-value">{analyticsData.confidence.average}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Minimum</span>
                <span className="metric-value">{analyticsData.confidence.min}%</span>
              </div>
              <div className="metric">
                <span className="metric-label">Maximum</span>
                <span className="metric-value">{analyticsData.confidence.max}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Social Media Monitoring */}
      <div className="social-analytics-section">
        <h3>Social Media Monitoring</h3>
        <SocialFeed />
      </div>

      {/* Timeline Data */}
      <div className="timeline-section">
        <h3>Activity Timeline (7 days)</h3>
        <div className="timeline-chart">
          {analyticsData.timeline.map((day, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-date">{day.date}</div>
              <div className="timeline-bars">
                <div 
                  className="timeline-bar total" 
                  style={{ height: `${(day.count / Math.max(...analyticsData.timeline.map(t => t.count))) * 50}px` }}
                  title={`Total: ${day.count}`}
                ></div>
                <div 
                  className="timeline-bar hazard" 
                  style={{ height: `${(day.hazardCount / Math.max(...analyticsData.timeline.map(t => t.hazardCount || 1))) * 50}px` }}
                  title={`Hazard: ${day.hazardCount}`}
                ></div>
              </div>
            </div>
          ))}
        </div>
        <div className="timeline-legend">
          <span className="legend-total">Total Posts</span>
          <span className="legend-hazard">Hazard Posts</span>
        </div>
      </div>
    </div>
  );
};
// Interactive Map Component
const InteractiveMap = ({ reports, hotspots, socialMediaData }) => {
  const [activeFilters, setActiveFilters] = useState({
    citizenReports: true,
    officialReports: true,
    socialMedia: true,
    hotspots: true
  });

  return (
    <div className="interactive-map">
      <div className="map-header">
        <h2>Live Hazard Map</h2>
        <p>Real-time visualization of ocean hazards and community reports</p>
      </div>
      
      <div className="map-container">
       <div className="map-visualization">
  <div className="map-stats">
    <span>{reports.length} Reports</span>
    <span>{hotspots.length} Hotspots</span>
    <span>{socialMediaData.length} Social Posts</span>
  </div>

  <MapContainer 
    center={[17.6868, 83.2185]} // initial center
    zoom={12} 
    style={{ height: '500px', width: '100%' }}
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="&copy; OpenStreetMap contributors"
    />

    {/* Citizen & Official Reports */}
    {activeFilters.citizenReports && reports.map(report => (
      <Marker key={`report-${report.id}`} position={[report.location.lat, report.location.lng]}>
        <Popup>
          <strong>{formatReportType(report.type)}</strong><br />
          {report.description}<br />
          Reported by: {report.reporter}
        </Popup>
      </Marker>
    ))}

    {/* Hotspots */}
    {activeFilters.hotspots && hotspots.map(hotspot => (
      <Marker 
        key={`hotspot-${hotspot.id}`} 
        position={[hotspot.location.lat, hotspot.location.lng]}
        icon={L.divIcon({
          className: 'hotspot-marker',
          html: `<span>${hotspot.severity}</span>`
        })}
      >
        <Popup>
          <strong>Hotspot Severity: {hotspot.severity}</strong><br />
          {hotspot.reportCount} reports
        </Popup>
      </Marker>
    ))}

    {/* Social Media */}
    {activeFilters.socialMedia && socialMediaData.map(post => (
      <Marker key={`post-${post.id}`} position={[post.location.lat, post.location.lng]}>
        <Popup>
          {post.text}<br />
          Sentiment: {post.sentiment}
        </Popup>
      </Marker>
    ))}
  </MapContainer>
</div>

        
        <div className="map-sidebar">
          <div className="filter-panel">
            <h3>Data Filters</h3>
            <div className="filter-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={activeFilters.citizenReports}
                  onChange={(e) => setActiveFilters({...activeFilters, citizenReports: e.target.checked})}
                />
                <span className="filter-color citizen"></span>
                Citizen Reports
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={activeFilters.officialReports}
                  onChange={(e) => setActiveFilters({...activeFilters, officialReports: e.target.checked})}
                />
                <span className="filter-color official"></span>
                Official Reports
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={activeFilters.socialMedia}
                  onChange={(e) => setActiveFilters({...activeFilters, socialMedia: e.target.checked})}
                />
                <span className="filter-color social"></span>
                Social Media
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={activeFilters.hotspots}
                  onChange={(e) => setActiveFilters({...activeFilters, hotspots: e.target.checked})}
                />
                <span className="filter-color hotspot"></span>
                Hotspots
              </label>
            </div>
          </div>
          
          <div className="time-filter">
            <h3>Time Range</h3>
            <select>
              <option>Last 24 hours</option>
              <option>Last 48 hours</option>
              <option>Last week</option>
              <option>Last month</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getReportIcon = (type) => {
  const icons = {
    highWaves: 'fa-water',
    flooding: 'fa-house-flood-water',
    tsunami: 'fa-wave-square',
    erosion: 'fa-hill-rockslide',
    pollution: 'fa-smog',
    other: 'fa-triangle-exclamation'
  };
  return icons[type] || 'fa-triangle-exclamation';
};

const formatReportType = (type) => {
  const names = {
    highWaves: 'High Waves',
    flooding: 'Coastal Flooding',
    tsunami: 'Tsunami Alert',
    erosion: 'Beach Erosion',
    pollution: 'Water Pollution',
    other: 'Other Hazard'
  };
  return names[type] || 'Unknown Hazard';
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default OceanWatch;