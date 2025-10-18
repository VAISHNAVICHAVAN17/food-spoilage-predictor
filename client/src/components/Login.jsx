import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import AuthContext from "../context/AuthContext";

function Login() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      const user = {
        _id: response.data.userId,
        userType: response.data.userType,
        name: response.data.name,
        token: response.data.token,
        email,
      };

      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      if (user.userType === "farmer") {
        navigate("/farmer/dashboard");
      } else if (user.userType === "warehouse") {
        navigate("/warehouse/dashboard");
      } else {
        setError("Unknown user type. Please try again.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </form>
        <p className="mt-3">
          Don't have an account? <Link to="/home">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
