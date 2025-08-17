import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatbotBox.css';

function ChatbotBox({ user }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState('menu');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [vehicle, setVehicle] = useState({ brand: '', model: '' });
  const [deliveryId, setDeliveryId] = useState('');
  const messagesEndRef = useRef(null);

  const toggleChat = () => {
    setOpen(!open);
    if (!open) {
      setStage('menu');
      setMessages([]);
      setDeliveryId('');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() && stage !== 'delivery') return; // only send if message exists (except delivery)
    const userMsg = input.trim();
    setMessages(prev => [...prev, { type: 'user', text: userMsg, timestamp: new Date() }]);
    setInput('');

    const payload = {
      stage,
      message: userMsg,
      brand: vehicle.brand,
      model: vehicle.model,
      deliveryId,
      user
    };

    try {
      const response = await fetch('http://localhost:3001/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!data.reply) return;

      setMessages(prev => [
        ...prev,
        {
          type: 'bot',
          text: data.reply,
          showButton: data.showButton || false,
          buttonText: data.buttonText || '',
          buttonLink: data.buttonLink || '',
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { type: 'bot', text: "Oops! Something went wrong. Please try again.", timestamp: new Date() }
      ]);
    }
  };

  const handleStartOption = (option) => {
    setStage(option);
    setMessages([]);
    setDeliveryId('');
    setInput('');
  };

  // Inside ChatbotBox.jsx

// Highlight delivery items with status colors
const formatMessage = (msg) => {
  if (stage === 'delivery' && msg.includes('•')) {
    const lines = msg.split('\n');

    return lines.map((line, index) => {
      const match = line.match(/• (\d+)x (.*?)\s*(?:\((.*?)\))?$/);
      if (!match) return <div key={index}>{line}</div>;

      const quantity = match[1];
      const item = match[2];
      const status = match[3] || 'Pending'; // default to Pending

      return (
        <div key={index} style={{ marginBottom: '4px' }}>
          <span>{quantity}x {item} ({status})</span>
        </div>
      );
    });
  }

  return <div>{msg}</div>; // fallback for other messages
};



  return (
    <div className="chatbot-container">
      <button className="chatbot-icon" onClick={toggleChat}>💬</button>

      {open && (
        <div className="chatbot-box">
          <div className="chatbot-messages">

            {stage === 'menu' && (
              <div className="chatbot-menu">
                <p className="chatbot-title">Select a topic:</p>
                <button className="chatbot-option" onClick={() => handleStartOption('general')}>💬 General Question</button>
                <button className="chatbot-option" onClick={() => handleStartOption('partFinder')}>🔧 Part Finder Help</button>
                <button className="chatbot-option" onClick={() => handleStartOption('rfq')}>📦 Request a Quote</button>
                <button className="chatbot-option" onClick={() => handleStartOption('delivery')}>🚚 Delivery Help</button>
              </div>
            )}

            {stage === 'partFinder' && (
              <div className="chatbot-vehicle-info">
                <p className="font-bold">Vehicle Info</p>
                <input placeholder="Brand" value={vehicle.brand} onChange={e => setVehicle({ ...vehicle, brand: e.target.value })} />
                <input placeholder="Model" value={vehicle.model} onChange={e => setVehicle({ ...vehicle, model: e.target.value })} />

              </div>
            )}

            {stage === 'delivery' && (
              <div>
                <p className="font-bold">Delivery ID (optional)</p>
                <input placeholder="Enter Delivery ID" value={deliveryId} onChange={e => setDeliveryId(e.target.value)} />
              </div>
            )}

            {messages.map((m, i) => {
              const isUser = m.type === 'user';
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                  <p style={{
                    color: isUser ? '#1976d2' : '#444',
                    textAlign: isUser ? 'right' : 'left',
                    fontWeight: isUser ? '600' : '400',
                    background: isUser ? '#e3f2fd' : '#f1f1f1',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    margin: '4px 0',
                    maxWidth: '80%',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px'
                  }}>
                    {formatMessage(m.text)}
                  </p>
                  <span style={{ fontSize: '0.7em', color: '#888', marginTop: '2px' }}>
                    {m.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>

                  {m.showButton && (
                    <button
                      onClick={() => navigate(m.buttonLink)}
                      style={{
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        marginTop: '4px'
                      }}
                    >
                      {m.buttonText}
                    </button>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {stage !== 'menu' && (
            <form onSubmit={e => { e.preventDefault(); sendMessage(); }}>
              <input
                name="message"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask your question..."
                required={stage !== 'delivery'}
              />
              <button type="submit">Send</button>
            </form>
          )}

          {stage !== 'menu' && (
            <button onClick={() => { setStage('menu'); setMessages([]); setDeliveryId(''); }} className="text-blue-500 mt-2">
              ⬅ Back to Menu
            </button>
          )}

        </div>
      )}
    </div>
  );
}

export default ChatbotBox;
