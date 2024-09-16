// src/components/Login.js
import React, { useState } from "react";
import { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "../firebase";
import { useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

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

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <h2 className="text-center">Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">Login</button>
            <button type="button" className="btn btn-secondary btn-block" onClick={handleSignup}>Sign Up</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
