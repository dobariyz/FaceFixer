import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login'; // Fixed path
import Dashboard from './components/Dashboard'; // Fixed case
import DetectionChart from './components/DetectionChart';
import Signup from './components/Signup';
import ProtectedRoutes from './components/ProtectedRoutes';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoutes>
              <Dashboard />
            </ProtectedRoutes>
          } 
        />
        
        <Route 
          path="/detection-chart" 
          element={
            <ProtectedRoutes>
              <DetectionChart />
            </ProtectedRoutes>
          } 
        />
        
        {/* Fallback route - redirect to login */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;