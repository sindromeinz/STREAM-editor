import React, { useEffect, useState, useRef } from 'react';
import { FaPaperPlane, FaMicrophone } from 'react-icons/fa';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './ChatBot.css';

const ChatBot = React.forwardRef((_, ref) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false); // New state to track summarization
  const [isRecording, setIsRecording] = useState(false); // State to track recording
  const recognitionRef = useRef(null); // Ref to store the recognition instance
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
      try {
        setLoading(true);
        
        // Send the message directly to the AI without placing it in the chat box
        const response = await axios.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateMessage?key=AIzaSyD1iSzJrlXHv0cHvBB_umWWmWMAzmYoD64',
          {
            prompt: {
              text: input
            },
            candidate_count: 1
          }
        );
        
        const botResponse = response.data.candidates[0].output;
        
        // Only update the chat with the AI's response
        setMessages([{ text: botResponse, user: false }]);
        
        setInput(''); // Reset input field
      } catch (error) {
        console.error('Error sending message:', error);
        setMessages([{ text: 'Error: Could not get response from AI', user: false }]);
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

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Your browser does not support speech recognition.');
      return;
    }
  
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
  
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
  
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
  
      // Automatically send the transcription as a message
      const newMessages = [...messages, { text: transcript, user: true }];
      setMessages(newMessages);
      handleSendMessage(transcript); // Pass the transcript to handleSendMessage
    };
  
    recognition.start();
    recognitionRef.current = recognition;
  };
  

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
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
        <button
          className={`mic-button ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={loading}
        >
          <FaMicrophone />
        </button>
      </div>
    </div>
  );
});

export default ChatBot;
