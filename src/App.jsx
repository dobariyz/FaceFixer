import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login'; // Fixed path
import Dashboard from './components/DashBoard'; // Fixed case
import DetectionChart from './components/DetectionChart';
import Signup from './components/Signup';
import ProtectedRoutes from './components/ProtectedRoutes';
import Recommendations from './components/Recommendations';
import { SessionProvider } from './components/SessionContext';
const App = () => {
  return (
    <SessionProvider>
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

        <Route 
          path="/recommendations" 
          element={
            <ProtectedRoutes>
              <Recommendations />
            </ProtectedRoutes>
          } 
        />
        
        {/* Fallback route - redirect to login */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
    </SessionProvider>
  );
};

export default App;