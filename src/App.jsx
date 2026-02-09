import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './components/DashBoard';
import DetectionChart from './components/DetectionChart';
import Signup from './components/Signup';
import ProtectedRoutes from './components/ProtectedRoutes';
import Recommendations from './components/Recommendations';
import TermsAndConditions from './components/TermsAndConditions';
import { SessionProvider } from './components/SessionContext';
import PaymentSuccess from './components/PaymentSuccess';

const App = () => {
  return (
    <SessionProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Terms Route - Requires authentication but not terms acceptance */}
          <Route 
            path="/terms" 
            element={
              localStorage.getItem('token') ? 
                <TermsAndConditions /> : 
                <Login />
            } 
          />
          
          {/* Protected Routes - Require both authentication AND terms acceptance */}
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
          <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={
              <div className="payment-result-container">
                <div className="payment-result-card">
                  <h1>Payment Cancelled</h1>
                  <p>You can upgrade anytime from your dashboard.</p>
                  <button onClick={() => navigate('/dashboard')}>
                    Return to Dashboard
                  </button>
                </div>
              </div>
            } />
          
          {/* Fallback route - redirect to login */}
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </SessionProvider>
  );
};

export default App;