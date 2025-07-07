import React, { useState } from 'react';
import './ChatbotBox.css'; // Import the CSS styling for the chatbot

// Main ChatbotBox component
function ChatbotBox() {
  // State to toggle chatbot open/close
  const [open, setOpen] = useState(false);

  // Controls which stage the chatbot is in (menu, general, partFinder, etc.)
  const [stage, setStage] = useState('menu');

  // Holds the conversation history (user and bot messages)
  const [messages, setMessages] = useState([]);

  // Controls the current input message
  const [input, setInput] = useState('');

  // Stores vehicle information when user chooses Part Finder
  const [vehicle, setVehicle] = useState({
    brand: '',
    model: '',
    year: '',
    vin: ''
  });

  // Toggles the chatbot open and resets to menu if opening
  const toggleChat = () => {
    setOpen(!open);
    if (!open) {
      setStage('menu');       // Reset to menu when opened
      setMessages([]);        // Clear previous messages
    }
  };

  // Function to send a message to the backend
  const sendMessage = async () => {
    // Prevent sending empty messages
    if (!input.trim()) return;

    const userMsg = input.trim(); // Clean up input
    setMessages(prev => [...prev, `You: ${userMsg}`]); // Add user message to chat
    setInput(''); // Clear input field

    // Prepare the payload for the backend
    let payload = { stage, message: userMsg };

    // If in partFinder stage, include vehicle info in the payload
    if (stage === 'partFinder') {
      payload = { stage, message: userMsg, ...vehicle };
    }

    try {
      // Send POST request to backend API
      const response = await fetch('http://localhost:3001/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Handle non-200 responses
      if (!response.ok) {
        throw new Error('Failed to contact chatbot');
      }

      // Parse the response and add bot's reply to messages
      const data = await response.json();
      setMessages(prev => [...prev, `Bot: ${data.reply}`]);

    } catch (err) {
      // Show error message if request fails
      setMessages(prev => [...prev, `Bot: [Error: ${err.message}]`]);
    }
  };

  // Function to switch stages from the main menu
  const handleStartOption = (option) => {
    setStage(option);
    setMessages([]); // Clear previous conversation for new topic
  };

  return (
    <div className="chatbot-container">
      {/* Toggle button for chatbot */}
      <button className="chatbot-icon" onClick={toggleChat}>💬</button>

      {/* Only show the chatbot box if it's open */}
      {open && (
        <div className="chatbot-box">
          <div className="chatbot-messages">
            
            {/* If in menu stage, display topic options */}
            {stage === 'menu' && (
              <div className="chatbot-menu">
                <p className="chatbot-title">Select a topic:</p>
                <button className="chatbot-option" onClick={() => handleStartOption('general')}>💬 General Question</button>
                <button className="chatbot-option" onClick={() => handleStartOption('partFinder')}>🔧 Part Finder Help</button>
                <button className="chatbot-option" onClick={() => handleStartOption('rfq')}>📦 Request a Quote</button>
                <button className="chatbot-option" onClick={() => handleStartOption('siteIssue')}>🛠️ Report a Site Issue</button>
              </div>
            )}

            {/* If in partFinder stage, show vehicle info form */}
            {stage === 'partFinder' && (
              <div>
                <p className="font-bold">Vehicle Info</p>
                <input
                  placeholder="Brand"
                  value={vehicle.brand}
                  onChange={(e) => setVehicle({ ...vehicle, brand: e.target.value })}
                />
                <input
                  placeholder="Model"
                  value={vehicle.model}
                  onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                />
                <input
                  placeholder="Year"
                  value={vehicle.year}
                  onChange={(e) => setVehicle({ ...vehicle, year: e.target.value })}
                />
                <input
                  placeholder="VIN"
                  value={vehicle.vin}
                  onChange={(e) => setVehicle({ ...vehicle, vin: e.target.value })}
                />
              </div>
            )}

            {/* Display chat messages */}
            <div className="chatbot-messages">
              {messages.map((m, i) => {
                const isUser = m.startsWith('You:');
                return (
                  <p
                    key={i}
                    style={{
                      color: isUser ? '#1976d2' : '#444',
                      textAlign: isUser ? 'right' : 'left',
                      fontWeight: isUser ? '600' : '400',
                      background: isUser ? '#e3f2fd' : '#f1f1f1',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      margin: '4px 0',
                      maxWidth: '80%',
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {m}
                  </p>
                );
              })}
            </div>

          </div>

          {/* Only show input form when not in menu */}
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

          {/* Back button to return to menu */}
          {stage !== 'menu' && (
            <button
              onClick={() => {
                setStage('menu');
                setMessages([]);
              }}
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
