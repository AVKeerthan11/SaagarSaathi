import React, { useState } from 'react';

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! 👋 I'm your OceanWatch assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: "user", text: input }]);
    setInput("");
    setIsTyping(true);

    // Simulate bot typing
    setTimeout(() => {
      setIsTyping(false);
      
      let reply = "I'm here to help with ocean hazard information. You can ask me about tsunamis, flooding, waves, or how to report hazards.";
      
      if (input.toLowerCase().includes("report")) {
        reply = "You can submit a hazard report from the 'Report Hazard' section. I can guide you through the process if you need help!";
      } else if (input.toLowerCase().includes("tsunami")) {
        reply = "🚨 In case of tsunami warning: Move to higher ground immediately. Follow official evacuation routes. Do not return until authorities declare it's safe.";
      } else if (input.toLowerCase().includes("wave") || input.toLowerCase().includes("high surf")) {
        reply = "High waves can be dangerous. Avoid beach activities during high surf advisories. Never turn your back to the ocean.";
      } else if (input.toLowerCase().includes("flood")) {
        reply = "During coastal flooding: Avoid walking or driving through flood waters. Just 6 inches of moving water can knock you down.";
      } else if (input.toLowerCase().includes("current")) {
        reply = "If caught in a rip current: Stay calm. Don't fight the current. Swim parallel to the shore until you're out of the current, then swim to shore.";
      } else if (input.toLowerCase().includes("storm")) {
        reply = "During ocean storms: Stay indoors away from windows. Avoid beach areas. Monitor official weather sources for updates.";
      } else if (input.toLowerCase().includes("thank")) {
        reply = "You're welcome! Stay safe out there. 🌊";
      }

      setMessages(prev => [...prev, { sender: "bot", text: reply }]);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const quickReplies = [
    "What should I do during a tsunami?",
    "How to report high waves?",
    "What are rip current safety tips?",
    "How does coastal flooding work?"
  ];

  return (
    <div className="floating-chatbot">
      <div className="chatbot-header">
        <h3>🤖 OceanWatch Assistant</h3>
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
        <p style={{ margin: 0, fontSize: '12px', color: '#6c757d' }}>Quick questions:</p>
        <div className="suggestion-chips">
          {quickReplies.map((suggestion, i) => (
            <button 
              key={i} 
              onClick={() => setInput(suggestion)}
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
          placeholder="Type your question..."
          disabled={isTyping}
        />
        <button onClick={handleSend} disabled={isTyping}>
          Send
        </button>
      </div>
      
      <div className="chatbot-status">
        <span className="status-indicator"></span>
        <span>Online</span>
      </div>
    </div>
  );
};

export default Chatbot;