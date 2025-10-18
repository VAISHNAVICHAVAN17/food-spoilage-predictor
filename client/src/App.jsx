import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import FarmerDashboard from './components/FarmerDashboard';
import WarehouseDashboard from './components/WarehouseDashboard';
import WarehouseInventory from './components/WarehouseInventory'; // <-- IMPORT your batch component
import CropForm from './components/CropForm';
import CropTracker from './components/CropTracker';
import CropAdvisor from './components/CropAdvisor';
import FarmerHelpBot from './components/FarmerHelpBot';
import RequireAuth from './utils/RequireAuth';
import CropSpoilageForm from './components/CropSpoilageForm';
import DetailedPrediction from "./components/DetailedPrediction";
import ImportExportForm from './components/ImportExportForm';


function App() {
  return (
    <Router>
      <Navbar />
      <div className="app-content-wrapper">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route path="/farmer/dashboard" element={<RequireAuth><FarmerDashboard /></RequireAuth>} />
          <Route path="/warehouse/dashboard" element={<RequireAuth><WarehouseDashboard /></RequireAuth>} />
          
          {/* This is the new route for inventory management */}
          <Route path="/warehouse/inventory" element={<RequireAuth><WarehouseInventory /></RequireAuth>} />
          
          <Route path="/cropform" element={<RequireAuth><CropForm /></RequireAuth>} />
          <Route path="/croptracker" element={<RequireAuth><CropTracker /></RequireAuth>} />
          <Route path="/predict" element={<RequireAuth><CropSpoilageForm /></RequireAuth>} />
          <Route path="/advisor" element={<RequireAuth><CropAdvisor /></RequireAuth>} />
          <Route path="/helpbot" element={<RequireAuth><FarmerHelpBot /></RequireAuth>} />
          <Route path="/details" element={<RequireAuth><DetailedPrediction /></RequireAuth>} />
           <Route path="/warehouse/importexport" element={<RequireAuth><ImportExportForm /></RequireAuth>} />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
