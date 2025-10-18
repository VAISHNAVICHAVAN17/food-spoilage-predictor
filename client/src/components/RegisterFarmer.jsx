// src/components/RegisterFarmer.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';
import { useNavigate } from 'react-router-dom';

function RegisterFarmer() {
  const [formData, setFormData] = useState({
    userType: 'farmer', 
    name: '',
    email: '',
    phone: '',
    password: '',
    region: '',
    farmSize: '',
    farmType: '',
    crops: '',
    acceptTerms: false
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', formData);
      setMessage(response.data.message);
      navigate('/home'); // Redirect to home after successful registration
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Farmer Registration</h2>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <input type="text" name="region" placeholder="Region" value={formData.region} onChange={handleChange} required />
          <input type="number" name="farmSize" placeholder="Farm Size (in acres)" value={formData.farmSize} onChange={handleChange} required />
          <select name="farmType" value={formData.farmType} onChange={handleChange} required>
            <option value="">Select Farm Type</option>
            <option value="crop">Crop</option>
            <option value="livestock">Livestock</option>
            <option value="mixed">Mixed</option>
          </select>
          <input type="text" name="crops" placeholder="Crops (optional)" value={formData.crops} onChange={handleChange} />
          <div className="form-check mb-3">
            <input className="form-check-input" type="checkbox" name="acceptTerms" id="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} required />
            <label className="form-check-label" htmlFor="acceptTerms">
              I accept the Terms and Conditions
            </label>
          </div>
          <button type="submit" className="btn btn-success">Register</button>
        </form>
      </div>
    </div>
  );
}

export default RegisterFarmer;
