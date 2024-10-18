// src/App.js
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Editor from "./components/Editor";
import FileManager from "./components/FileManager";
import ChatBot from './components/ChatBot';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap styles are imported
import { ChatProvider } from './components/ChatContext'; // Import ChatProvider

function App() {
  return (
    <ChatProvider> {/* Wrap your application with ChatProvider */}
      <Router>
        <div className="min-vh-100 d-flex flex-column">
          <div className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/files" element={<FileManager />} />
              <Route path="/editor/:fileId" element={<Editor />} />
              <Route path="/chatbot" element={<ChatBot />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ChatProvider>
  );
}

export default App;
