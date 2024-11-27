// src/components/Login.js
import React, { useState } from "react";
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithGoogle } from "../firebase";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Login.css'; // Create a separate CSS file for custom styles

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/files"); // Navigate to FileManager
    } catch (error) {
      console.error("Error logging in:", error.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/files"); // Navigate to FileManager
    } catch (error) {
      console.error("Error signing up:", error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate("/files"); // Navigate to FileManager on successful login
    } catch (error) {
      console.error("Error with Google login:", error.message);
    }
  };

  return (
    <div className="background">
      <div className="shape"></div>
      <div className="shape"></div>
      <form onSubmit={handleLogin}>
        <h3>STREAM</h3>

        <label htmlFor="email">Email</label>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Log In</button>
        <button type="button" onClick={handleSignup}>Sign Up</button>

        <div className="social">
          <div className="go" onClick={handleGoogleLogin}>
            <i className="fab fa-google"></i> Google
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
