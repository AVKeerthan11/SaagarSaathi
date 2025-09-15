import React, { useState } from 'react';
import chatbotNLP from '../services/chatbotNLP';

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I'm your Ocean Safety Assistant. How can I help you with ocean hazards or beach safety today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: "user", text: input }]);
    setInput("");
    setIsTyping(true);

    // Process with NLP engine
    setTimeout(() => {
      setIsTyping(false);
      const response = chatbotNLP.processInput(input);
      setMessages(prev => [...prev, { sender: "bot", text: response }]);
    }, 800 + Math.random() * 800); // Simulate thinking time
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

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
    <div className="floating-chatbot">
      <div className="chatbot-header">
        <h3>🌊 Ocean Safety Assistant</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      
      <div className="chatbot-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.sender}`}>
            {msg.text}
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
      
      <div className="chat-suggestions">
        <p style={{ margin: 0, fontSize: '12px', color: '#6c757d' }}>Ask about:</p>
        <div className="suggestion-chips">
          {quickReplies.map((suggestion, i) => (
            <button 
              key={i} 
              onClick={() => {
                setInput(suggestion);
                setTimeout(() => handleSend(), 100);
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
      
      <div className="chatbot-input">
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about ocean safety..."
          disabled={isTyping}
        />
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

export default Chatbot;