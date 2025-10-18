import React from 'react';

function CropActivity() {
  return (
    <div className="container mt-5">
      <h2 className="text-success">Crop Activity Monitoring</h2>
      <p>Welcome, Farmer! This page will help you monitor crop cutting and related field activities.</p>

      <div className="card mt-4 p-4">
        <h5>Current Crop Status</h5>
        <p>We will soon integrate real-time satellite or drone monitoring here.</p>
        <ul>
          <li>Crop Cutting Progress</li>
          <li>Soil Condition</li>
          <li>Weather Impact</li>
          <li>Harvest Forecast</li>
        </ul>
        <p className="text-muted">AI integration coming soon...</p>
      </div>
    </div>
  );
}

export default CropActivity;
