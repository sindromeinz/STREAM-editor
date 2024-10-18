import React, { useState } from 'react';
import './Gemini.css'; // Create a CSS file for styling

const Gemini = ({ onGenerate }) => {
  const [input, setInput] = useState('');

  const handleGenerate = async () => {
    if (!input.trim()) return;
    
    try {
      // Call the Gemini API here
      // Replace with your API call
      const response = await fetch('AIzaSyD1iSzJrlXHv0cHvBB_umWWmWMAzmYoD64', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any required headers like authorization here
        },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      onGenerate(data.output); // Assuming the API response contains the output
    } catch (error) {
      console.error('Error fetching from Gemini API:', error);
    }
  };

  return (
    <div className="gemini-container">
      <h3>Gemini AI</h3>
      <textarea
        placeholder="Enter your prompt..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={5}
        className="gemini-input"
      />
      <button className="btn btn-secondary mt-2" onClick={handleGenerate}>
        Generate
      </button>
    </div>
  );
};

export default Gemini;
