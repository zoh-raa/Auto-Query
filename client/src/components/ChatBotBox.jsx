import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatbotBox.css';

function ChatbotBox() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState('menu');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [vehicle, setVehicle] = useState({ brand: '', model: '', year: '', vin: '' });

  const toggleChat = () => {
    setOpen(!open);
    if (!open) {
      setStage('menu');
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
    setInput('');

    let payload = { stage, message: userMsg };
    if (stage === 'partFinder') payload = { stage, message: userMsg, ...vehicle };

    try {
      const response = await fetch('http://localhost:3001/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        setMessages(prev => [
          ...prev,
          {
            type: 'bot',
            text: data.reply,
            showButton: data.showButton || false,
            buttonText: data.buttonText || '',
            buttonLink: data.buttonLink || ''
          }
        ]);
      } else {
        setMessages(prev => [...prev, { type: 'bot', text: "Please enter a valid question." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { type: 'bot', text: "Please enter a valid question." }]);
    }
  };

  const handleStartOption = (option) => {
    setStage(option);
    setMessages([]);
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
                <button className="chatbot-option" onClick={() => handleStartOption('siteIssue')}>🛠️ Report a Site Issue</button>
              </div>
            )}

            {stage === 'partFinder' && (
              <div>
                <p className="font-bold">Vehicle Info</p>
                <input placeholder="Brand" value={vehicle.brand} onChange={(e) => setVehicle({ ...vehicle, brand: e.target.value })} />
                <input placeholder="Model" value={vehicle.model} onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })} />
                <input placeholder="Year" value={vehicle.year} onChange={(e) => setVehicle({ ...vehicle, year: e.target.value })} />
                <input placeholder="VIN" value={vehicle.vin} onChange={(e) => setVehicle({ ...vehicle, vin: e.target.value })} />
              </div>
            )}

            {/* Chat messages */}
            {messages.map((m, i) => {
              const isUser = m.type === 'user';
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                  <p
                    style={{
                      color: isUser ? '#1976d2' : '#444',
                      textAlign: isUser ? 'right' : 'left',
                      fontWeight: isUser ? '600' : '400',
                      background: isUser ? '#e3f2fd' : '#f1f1f1',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      margin: '4px 0',
                      maxWidth: '80%',
                    }}
                  >
                    {m.text}
                  </p>

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
          </div>

          {stage !== 'menu' && (
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
              <input
                name="message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your question..."
                required
              />
              <button type="submit">Send</button>
            </form>
          )}

          {stage !== 'menu' && (
            <button
              onClick={() => { setStage('menu'); setMessages([]); }}
              className="text-blue-500 mt-2"
            >
              ⬅ Back to Menu
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ChatbotBox;
