import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import http from '../https';

// Array of delivery provider options with estimated delivery times
const options = [
  { name: 'Lalamove', time: '24/7 or 0-1 day' },
  { name: 'GrabExpress', time: '0-1 day' },
  { name: 'NinjaVan', time: '1-3 days' },
  { name: 'Pandago', time: '0-1 day' },
  { name: 'iXpress Logistics', time: '0-1 day' },
  { name: 'Qdelivery', time: '1-3 days' },
  { name: 'UParcel', time: '0-1 day' },
  { name: 'DHLExpress', time: '1 day' },
];

const SelectDelivery = () => {
  const location = useLocation();
  const rfq = location.state?.rfq;
  // State to track the currently selected delivery provider
  const [selected, setSelected] = useState(null);

  // React Router's navigation function to programmatically change routes
  const navigate = useNavigate();

  // Function to handle "Continue" button click
  const handleContinue = () => {
    // Alert if no provider is selected
    if (!selected) {
      alert('Please select a delivery provider before continuing.');
      return;
    }
    // Navigate to the '/add-delivery' route and pass the selected provider via route state
    navigate('/add-delivery', { state: { provider: selected, rfq } });
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Header */}
      <h2 className="text-xl font-bold mb-4 text-center">Select Your Delivery Provider</h2>

      {/* Grid container for delivery provider options */}
      <div className="delivery-grid">
        {options.map((opt, idx) => (
          // Each option rendered as a clickable card
          <div
            key={idx}
            onClick={() => setSelected(opt.name)} // Set selected on click
            className={`delivery-card ${selected === opt.name ? 'selected' : ''}`} // Highlight if selected
          >
            <h3>{opt.name}</h3>
            <p>{opt.time}</p>
          </div>
        ))}
      </div>

      {/* Continue button centered below the options */}
      <div className="text-center mt-6">
        <button
          onClick={handleContinue}
          disabled={!selected}
          className={`px-8 py-3 rounded-xl font-semibold shadow-md transition-all duration-300 
      ${selected
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:scale-105 hover:shadow-lg"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          Continue to Delivery Form
        </button>
      </div>

      {/* Confirmation message shown if a delivery provider is selected */}
      {selected && (
        <p className="mt-4 text-center text-green-600">
          ✅ You selected: <strong>{selected}</strong>
        </p>
      )}
    </div>
  );
};

export default SelectDelivery;
