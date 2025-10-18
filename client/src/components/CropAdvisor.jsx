import React, { useState } from 'react';
import axios from 'axios';

function CropAdvisor() {
  const [city, setCity] = useState('');
  const [advice, setAdvice] = useState('');
  const [error, setError] = useState('');

  const handleGetAdvice = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/advisor', { city });
      setAdvice(res.data.advice);
      setError('');
    } catch (err) {
      console.error('Advisor error:', err);
      setError('Failed to get advice. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Crop Advisor</h2>
      <form onSubmit={handleGetAdvice}>
        <input
          type="text"
          placeholder="Enter your city"
          className="form-control mb-3"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-success">Get Advice</button>
      </form>
      {advice && <div className="alert alert-info mt-3">{advice}</div>}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
}

export default CropAdvisor;
