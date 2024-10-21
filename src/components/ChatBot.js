import React, { useEffect, useState, useRef } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './ChatBot.css'; // Import the ChatBot specific styles

const ChatBot = React.forwardRef((_, ref) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false); // New state to track summarization
  const messagesEndRef = useRef(null); // Ref for scrolling

  // Expose handleCommand method to the parent component
  React.useImperativeHandle(ref, () => ({
    handleCommand: async (command) => {
      if (command.startsWith('summarise')) {
        const contentToSummarize = command.replace('summarise ', '').trim();
        await handleSummarize(contentToSummarize);
      }
    }
  }));

  const handleSendMessage = async () => {
    if (input.trim()) {
      const newMessages = [...messages, { text: input, user: true }];
      setMessages(newMessages);
      setInput(''); // Reset input field

      try {
        setLoading(true);
        const response = await axios.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyD1iSzJrlXHv0cHvBB_umWWmWMAzmYoD64',
          {
            contents: [
              {
                parts: [
                  {
                    text: input
                  }
                ]
              }
            ]
          }
        );

        const botResponse = response.data.candidates[0].content.parts[0].text;
        setMessages([...newMessages, { text: botResponse, user: false }]);
      } catch (error) {
        console.error('Error sending message:', error);
        setMessages([...newMessages, { text: 'Error: Could not get response from AI', user: false }]);
      } finally {
        setLoading(false); // Ensure loading is reset regardless of the outcome
      }
    }
  };

  const handleSummarize = async (text) => {
    if (text) {
      setIsSummarizing(true); // Set summarizing state to true
  
      try {
        setLoading(true);
        const response = await axios.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyD1iSzJrlXHv0cHvBB_umWWmWMAzmYoD64',
          {
            contents: [
              {
                parts: [
                  {
                    text: `Summarize the following text: "${text}"`
                  }
                ]
              }
            ]
          }
        );
  
        const botResponse = response.data.candidates[0].content.parts[0].text;
        setMessages([...messages, { text: botResponse, user: false }]); // Only add bot's response
      } catch (error) {
        console.error('Error summarizing text:', error);
        setMessages([...messages, { text: 'Error: Could not get summary from AI', user: false }]);
      } finally {
        setLoading(false); // Reset loading state
        setIsSummarizing(false); // Reset summarizing state
      }
    }
  };
  

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom(); // Scroll to the bottom whenever messages change
  }, [messages]);

  return (
    <div className="chatbot-container">
      <h2 className="chatbot-title">GEMINI</h2>
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.user ? 'user-message' : 'bot-message'}`}>
            {/* Hide user message when summarizing */}
            {msg.user && isSummarizing ? null : (
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            )}
          </div>
        ))}
        {loading && <div className="loader">Loading...</div>}
        <div ref={messagesEndRef} /> {/* This div acts as the scroll target */}
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          className="input-field"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} // Changed to onKeyDown for faster response
        />
        <button
          className="send-button"
          onClick={handleSendMessage}
          disabled={loading} // Disable the button while loading
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
});

export default ChatBot;
