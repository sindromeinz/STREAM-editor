// src/App.js
import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Editor from "./components/Editor";
import FileManager from "./components/FileManager";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/files" element={<FileManager />} />
        <Route path="/editor/:fileId" element={<Editor />} />
      </Routes>
    </Router>
  );
}

export default App;
