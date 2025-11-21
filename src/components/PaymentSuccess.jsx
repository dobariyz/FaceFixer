import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('No session ID found');
      setIsProcessing(false);
      return;
    }

    // Complete the upgrade
    completeUpgrade(sessionId);
  }, [searchParams]);

  const completeUpgrade = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/payment/complete-upgrade?session_id=${sessionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Upgrade completed:', data);
        
        // Wait 2 seconds then redirect
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to complete upgrade');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Error completing upgrade:', err);
      setError('An error occurred while completing your upgrade');
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-result-container">
      <div className="payment-result-card">
        {isProcessing && !error && (
          <>
            <div className="payment-icon payment-icon-success">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h1 className="payment-title">Payment Successful!</h1>
            <p className="payment-message">
              Thank you for upgrading! We're processing your subscription...
            </p>
            <div className="payment-spinner"></div>
          </>
        )}

        {error && (
          <>
            <div className="payment-icon payment-icon-error">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h1 className="payment-title payment-title-error">Something Went Wrong</h1>
            <p className="payment-message">{error}</p>
            <button className="payment-btn" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;