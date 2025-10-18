// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-wrapper d-flex align-items-center justify-content-center">
      <div className="card p-5 shadow-lg text-center bg-light home-card">
        <h1 className="mb-3 text-success">🌾 Food Spoilage Predictor</h1>
        <p className="lead">
          Predict how long your stored crops will last based on real-time weather.
          <br />
          Ideal for Farmers & Warehouse Owners 🌦️
        </p>

        <div className="mt-4 d-flex justify-content-center gap-3">
          <Link to="/register/farmer" className="btn btn-success px-4">Farmer Register</Link>
          <Link to="/register/warehouse" className="btn btn-outline-success px-4">Warehouse Register</Link>
          <Link to="/login" className="btn btn-secondary px-4">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;