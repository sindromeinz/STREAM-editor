// src/App.js
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Editor from "./components/Editor";
import FileManager from "./components/FileManager";
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap styles are imported

function App() {
  return (
    <Router>
      <div className="min-vh-100 d-flex flex-column">
        <header className="bg-primary text-white text-center py-3">
          <h1>STREAM-editor</h1>
        </header>
        <div className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/files" element={<FileManager />} />
            <Route path="/editor/:fileId" element={<Editor />} />
          </Routes>
        </div>
        <footer className="bg-light text-center py-3">
          <p className="mb-0">© {new Date().getFullYear()} STREAM-editor. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
