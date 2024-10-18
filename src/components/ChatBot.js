import React, { useEffect, useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './ChatBot.css'; // Import the ChatBot specific styles

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (input.trim()) {
      const newMessages = [...messages, { text: input, user: true }];
      setMessages(newMessages);
      setInput('');

      try {
        setLoading(true);
        const response = await axios.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyD1iSzJrlXHv0cHvBB_umWWmWMAzmYoD64',
          {
            "contents": [
              {
                "parts": [
                  {
                    "text": input
                  }
                ]
              }
            ]
          }
        );
        const botResponse = response.data.candidates[0].content.parts[0].text;
        setLoading(false);
        setMessages([...newMessages, { text: botResponse, user: false }]);
      } catch (error) {
        console.error('Error sending message:', error);
        setLoading(false);
        setMessages([...newMessages, { text: 'Error: Could not get response from AI', user: false }]);
      }
    }
  };

  return (
    <div className="chatbot-container">
      <h2 className="chatbot-title">GEMINI</h2>
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.user ? 'user-message' : 'bot-message'}`}>
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        ))}
        {loading && (
          <div className="loader">Loading...</div>
        )}
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          className="input-field"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          className="send-button"
          onClick={handleSendMessage}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
