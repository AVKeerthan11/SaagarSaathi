import React, { useState, useEffect, useRef } from 'react';
import './OceanWatch.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SocialFeed from './components/SocialAnalytics/SocialFeed';
import sentimentService from './services/sentimentService';
import analyticsService from './services/analyticsService';
import chatbotNLP from './services/chatbotNLP';
import realTimeService from './services/realTimeService';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const getHazardColor = (type) => {
  const colors = {
    highWaves: '#007bff',
    flooding: '#28a745',
    erosion: '#ffc107',
    storm: '#dc3545',
    tsunami: '#ff6b35',
    pollution: '#6f42c1',
    other: '#6c757d'
  };
  return colors[type] || '#6c757d';
};

const OceanWatch = () => {
  const [userRole, setUserRole] = useState('citizen');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('map');
  const [reports, setReports] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [socialMediaData, setSocialMediaData] = useState([]);
  const [showChatbot, setShowChatbot] = useState(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);

  // Initialize with sample data and connect to real-time service
  useEffect(() => {
    // Sample data for demonstration
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

    setReports(mockReports);
    setHotspots(mockHotspots);

    // Connect to real-time service for social media updates
    if (realTimeUpdates) {
      realTimeService.connect();
      
      realTimeService.on('new_social_post', (newPost) => {
        setSocialMediaData(prevData => {
          // Add sentiment analysis to new post
          const sentimentResult = sentimentService.analyzeSentiment(newPost.text);
          const enrichedPost = {
            ...newPost,
            sentiment: sentimentResult.sentiment,
            confidence: sentimentResult.confidence,
            analysis: {
              hazardType: detectHazardType(newPost.text),
              confidence: sentimentResult.confidence
            }
          };
          
          // Keep only the latest 100 posts for performance
          const updatedData = [enrichedPost, ...prevData];
          return updatedData.length > 100 ? updatedData.slice(0, 100) : updatedData;
        });
      });

      return () => {
        realTimeService.disconnect();
      };
    }
  }, [realTimeUpdates]);

  const detectHazardType = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('wave') || lowerText.includes('current')) return 'highWaves';
    if (lowerText.includes('flood') || lowerText.includes('water level')) return 'flooding';
    if (lowerText.includes('erosion') || lowerText.includes('beach erosion')) return 'erosion';
    if (lowerText.includes('storm') || lowerText.includes('warning')) return 'storm';
    if (lowerText.includes('tsunami')) return 'tsunami';
    if (lowerText.includes('pollution') || lowerText.includes('contamination')) return 'pollution';
    return 'other';
  };

  // Toggle real-time updates
  const toggleRealTimeUpdates = () => {
    setRealTimeUpdates(!realTimeUpdates);
    if (!realTimeUpdates) {
      realTimeService.connect();
    } else {
      realTimeService.disconnect();
    }
  };

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
        realTimeUpdates={realTimeUpdates}
        toggleRealTimeUpdates={toggleRealTimeUpdates}
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
      
      {/* Draggable Chatbot Button for Citizens */}
      {userRole === 'citizen' && !showChatbot && (
        <DraggableChatbotButton onClick={() => setShowChatbot(true)} />
      )}
    </div>
  );
};

// Draggable Chatbot Button Component
const DraggableChatbotButton = ({ onClick }) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStartPos.current.x,
      y: e.clientY - dragStartPos.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <button 
      className="floating-chatbot-btn"
      onClick={onClick}
      onMouseDown={handleMouseDown}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: 1000
      }}
    >
      🤖 Chat
    </button>
  );
};

// Floating Chatbot Component
const FloatingChatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm your Ocean Hazard Assistant. Ask me about ocean hazards 🌊" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [position, setPosition] = useState({ x: window.innerWidth - 400, y: 60 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const chatContainerRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { from: "user", text: input }]);
    setInput("");
    setIsTyping(true);
    setShowSuggestions(false);

    // Process with NLP engine
    setTimeout(() => {
      setIsTyping(false);
      const response = chatbotNLP.processInput(input);
      setMessages(prev => [...prev, { from: "bot", text: response }]);
    }, 800 + Math.random() * 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setShowSuggestions(false);
    setTimeout(() => handleSend(), 100);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleHeaderMouseDown = (e) => {
    if (e.target.classList.contains('close-btn') || 
        e.target.classList.contains('expand-btn') ||
        e.target.closest('.close-btn') || 
        e.target.closest('.expand-btn')) {
      return;
    }
    
    setIsDragging(true);
    const rect = chatContainerRef.current.getBoundingClientRect();
    dragStartPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStartPos.current.x,
      y: e.clientY - dragStartPos.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Quick replies focused on ocean safety
  const quickReplies = [
    "Tsunami safety tips",
    "How to spot rip currents",
    "Reporting a hazard",
    "Beach conditions today",
    "What to do during coastal flooding",
    "Wave safety guidelines"
  ];

  return (
    <div 
      className={`floating-chatbot ${isExpanded ? 'expanded' : ''}`}
      ref={chatContainerRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default',
        zIndex: 1000
      }}
    >
      <div className="chatbot-header" onMouseDown={handleHeaderMouseDown}>
        <div className="header-left">
          <h3>🌊 Ocean Safety Assistant</h3>
          <button onClick={toggleExpand} className="expand-btn" title={isExpanded ? "Shrink" : "Expand"}>
            {isExpanded ? '⊟' : '⊞'}
          </button>
        </div>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      
      <div className="chatbot-messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.from}`}>
            {m.text}
          </div>
        ))}
        
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}
      </div>
      
      {showSuggestions && (
        <div className="chat-suggestions">
          <div className="suggestions-header">
            <p>Quick questions:</p>
            <button 
              onClick={() => setShowSuggestions(false)} 
              className="hide-suggestions-btn"
              title="Hide suggestions"
            >
              ×
            </button>
          </div>
          <div className="suggestion-chips">
            {quickReplies.map((suggestion, i) => (
              <button 
                key={i} 
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="chatbot-input">
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about ocean safety..."
          disabled={isTyping}
          onFocus={() => setShowSuggestions(false)}
        />
        <button 
          onClick={() => setShowSuggestions(!showSuggestions)} 
          className="suggestions-toggle"
          title="Show suggestions"
        >
          💡
        </button>
        <button onClick={handleSend} disabled={isTyping || !input.trim()}>
          Send
        </button>
      </div>
      
      <div className="chatbot-status">
        <span className="status-indicator"></span>
        <span>Ocean Safety Specialist</span>
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

// Header Component with real-time toggle
const Header = ({ currentView, setCurrentView, userRole, setUserRole, setIsLoggedIn, realTimeUpdates, toggleRealTimeUpdates }) => {
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
          {userRole === 'official' && (
            <div className="real-time-toggle">
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={realTimeUpdates}
                  onChange={toggleRealTimeUpdates}
                />
                <span className="slider round"></span>
              </label>
              <span className="toggle-label">Live Updates</span>
            </div>
          )}
          
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
            <h3>{reports ? reports.length : 0}</h3>
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

// Analytics Dashboard Component - ENHANCED
const AnalyticsDashboard = ({ reports, socialMediaData, hotspots }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedHazard, setSelectedHazard] = useState('all');

  useEffect(() => {
    if (socialMediaData && socialMediaData.length > 0) {
      const data = analyticsService.analyzePosts(socialMediaData, timeRange, selectedHazard);
      setAnalyticsData(data);
    } else {
      setAnalyticsData(null);
    }
  }, [socialMediaData, timeRange, selectedHazard]);

  // Filter social media data based on selected hazard
  const filteredSocialData = selectedHazard === 'all' 
    ? socialMediaData 
    : socialMediaData.filter(post => post.analysis.hazardType === selectedHazard);

  if (!analyticsData) {
    return (
      <div className="analytics-dashboard">
        <div className="analytics-header">
          <h2>Analytics & Insights</h2>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  const sentimentPercentages = sentimentService.updateSentimentStats(filteredSocialData);
  const sentimentCounts = sentimentService.getSentimentCounts();

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>Analytics & Insights</h2>
        
        <div className="analytics-controls">
          <div className="filter-control">
            <label>Time Range:</label>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="styled-select"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          
          <div className="filter-control">
            <label>Hazard Type:</label>
            <select 
              value={selectedHazard} 
              onChange={(e) => setSelectedHazard(e.target.value)}
              className="styled-select"
            >
              <option value="all">All Hazards</option>
              <option value="highWaves">High Waves</option>
              <option value="flooding">Flooding</option>
              <option value="erosion">Erosion</option>
              <option value="storm">Storm</option>
              <option value="tsunami">Tsunami</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="stats-overview">
        {/* <div className="stat-card">
          <h3>{reports.length}</h3>
          <p>Total Reports</p>
        </div> */}
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
        <SocialFeed socialMediaData={filteredSocialData} />
      </div>

      {/* Geographic Distribution */}
      <div className="geographic-section">
        <h3>Geographic Distribution</h3>
        <div className="location-stats">
          {analyticsData.topLocations && analyticsData.topLocations.length > 0 ? (
            analyticsData.topLocations.map((location, index) => (
              <div key={index} className="location-item">
                <span className="location-name">{location.name}</span>
                <div className="location-bar-container">
                  <div 
                    className="location-bar" 
                    style={{ width: `${(location.count / Math.max(...analyticsData.topLocations.map(l => l.count))) * 100}%` }}
                  ></div>
                </div>
                <span className="location-count">{location.count} posts</span>
              </div>
            ))
          ) : (
            <p>No location data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Interactive Map Component - FIXED LATLNG ERROR
const InteractiveMap = ({ reports, hotspots, socialMediaData }) => {
  const [activeFilters, setActiveFilters] = useState({
    citizenReports: true,
    officialReports: true,
    socialMedia: true,
    hotspots: true
  });

  // Create custom icons for different types of markers
  const createCustomIcon = (type, isHotspot = false) => {
    const iconHtml = isHotspot 
      ? `<div class="hotspot-marker">🔥</div>`
      : `<div class="custom-marker ${type}">${getMarkerEmoji(type)}</div>`;
    
    return L.divIcon({
      className: 'custom-icon',
      html: iconHtml,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  const getMarkerEmoji = (type) => {
    const emojis = {
      highWaves: '🌊',
      flooding: '💧',
      tsunami: '🌊',
      erosion: '🏖️',
      pollution: '☣️',
      storm: '⛈️',
      other: '⚠️'
    };
    return emojis[type] || '📍';
  };

  // Function to validate coordinates
  const isValidCoordinate = (coord) => {
    return coord && typeof coord.lat === 'number' && typeof coord.lng === 'number' && 
           !isNaN(coord.lat) && !isNaN(coord.lng);
  };

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
            center={[17.6868, 83.2185]}
            zoom={12} 
            style={{ height: '500px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* Citizen & Official Reports - with coordinate validation */}
            {activeFilters.citizenReports && reports.map(report => (
              isValidCoordinate(report.location) && (
                <Marker 
                  key={`report-${report.id}`} 
                  position={[report.location.lat, report.location.lng]}
                  icon={createCustomIcon(report.type)}
                >
                  <Popup>
                    <div className="map-popup">
                      <h4>{formatReportType(report.type)}</h4>
                      <p>{report.description}</p>
                      <div className="popup-details">
                        <span className="reporter">Reported by: {report.reporter}</span>
                        <span className={`urgency ${report.urgency}`}>{report.urgency} urgency</span>
                        <span className="timestamp">{formatTime(report.timestamp)}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}

            {/* Hotspots - with coordinate validation */}
            {activeFilters.hotspots && hotspots.map(hotspot => (
              isValidCoordinate(hotspot.location) && (
                <Marker 
                  key={`hotspot-${hotspot.id}`} 
                  position={[hotspot.location.lat, hotspot.location.lng]}
                  icon={createCustomIcon('hotspot', true)}
                >
                  <Popup>
                    <div className="map-popup">
                      <h4>Hotspot: {hotspot.severity} severity</h4>
                      <p>{hotspot.reportCount} reports in this area</p>
                      <div className="popup-details">
                        <span className="coordinates">
                          {hotspot.location.lat.toFixed(4)}, {hotspot.location.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}

            {/* Social Media - with coordinate validation */}
            {activeFilters.socialMedia && socialMediaData.map(post => (
              isValidCoordinate(post.coordinates) && (
                <Marker 
                  key={`post-${post.id}`} 
                  position={[post.coordinates.lat, post.coordinates.lng]}
                  icon={createCustomIcon(post.analysis?.hazardType || 'other')}
                >
                  <Popup>
                    <div className="map-popup">
                      <h4>Social Media Post</h4>
                      <p>{post.text}</p>
                      <div className="popup-details">
                        <span className={`sentiment ${post.sentiment}`}>Sentiment: {post.sentiment}</span>
                        <span className="hazard-type">Hazard: {post.analysis?.hazardType || 'other'}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
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
          
          <div className="legend">
            <h3>Legend</h3>
            <div className="legend-item">
              <span className="legend-icon">🌊</span> High Waves
            </div>
            <div className="legend-item">
              <span className="legend-icon">💧</span> Flooding
            </div>
            <div className="legend-item">
              <span className="legend-icon">⛈️</span> Storm
            </div>
            <div className="legend-item">
              <span className="legend-icon">🏖️</span> Erosion
            </div>
            <div className="legend-item">
              <span className="legend-icon">☣️</span> Pollution
            </div>
            <div className="legend-item">
              <span className="legend-icon">🔥</span> Hotspots
            </div>
            <div className="legend-item">
              <span className="legend-icon">📍</span> Social Media
            </div>
          </div>
          
          <div className="time-filter">
            <h3>Time Range</h3>
            <select className="styled-select">
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