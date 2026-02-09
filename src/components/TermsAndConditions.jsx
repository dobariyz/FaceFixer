import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TermsAndConditions.css';

const TermsAndConditions = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAccept = async () => {
    if (!isChecked) {
      setError('Please accept the terms and conditions to continue');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/auth/accept-terms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Store acceptance in localStorage as a temporary flag
        localStorage.setItem('termsAccepted', 'true');
        
        // Navigate with state to force remount
        navigate('/dashboard', { replace: true, state: { termsJustAccepted: true } });
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to accept terms');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error accepting terms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('termsAccepted');
    navigate('/login');
  };

  return (
    <div className="terms-container">
      <div className="terms-card">
        <div className="terms-header">
          <h1>Terms and Conditions</h1>
          <p className="terms-subtitle">Please read and accept our terms to continue</p>
        </div>

        <div className="terms-content">
          <div className="terms-scroll">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using FaceFixer, you accept and agree to be bound by the terms
              and provision of this agreement. If you do not agree to these terms, please do not
              use our service.
            </p>

            <h2>2. Use of Service</h2>
            <p>
              FaceFixer provides AI-powered face detection and analysis services. You agree to use
              this service only for lawful purposes and in accordance with these terms.
            </p>

            <h2>3. User Responsibilities</h2>
            <ul>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You must not upload images that violate others' privacy rights</li>
              <li>You must not use the service for any illegal or unauthorized purpose</li>
              <li>You must not attempt to interfere with the proper working of the service</li>
            </ul>

            <h2>4. Privacy and Data Protection</h2>
            <p>
              We take your privacy seriously. All uploaded images are processed securely and are
              not shared with third parties. We collect and store only necessary user information
              as outlined in our Privacy Policy.
            </p>

            <h2>5. Intellectual Property</h2>
            <p>
              The service and its original content, features, and functionality are owned by
              FaceFixer and are protected by international copyright, trademark, patent, trade
              secret, and other intellectual property laws.
            </p>

            <h2>6. Limitation of Liability</h2>
            <p>
              FaceFixer shall not be liable for any indirect, incidental, special, consequential,
              or punitive damages resulting from your use of or inability to use the service.
            </p>

            <h2>7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any
              material changes via email or through the service.
            </p>

            <h2>8. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at
              support@facefixer.com
            </p>

            <p className="terms-effective-date">
              <strong>Last Updated:</strong> November 6, 2025
            </p>
          </div>
        </div>

        {error && <div className="terms-error">{error}</div>}

        <div className="terms-checkbox-container">
          <label className="terms-checkbox-label">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => {
                setIsChecked(e.target.checked);
                setError('');
              }}
              className="terms-checkbox"
            />
            <span>I have read and agree to the Terms and Conditions</span>
          </label>
        </div>

        <div className="terms-actions">
          <button
            onClick={handleLogout}
            className="terms-btn terms-btn-secondary"
            disabled={isLoading}
          >
            Logout
          </button>
          <button
            onClick={handleAccept}
            className={`terms-btn terms-btn-primary ${!isChecked ? 'disabled' : ''}`}
            disabled={!isChecked || isLoading}
          >
            {isLoading ? 'Processing...' : 'Accept & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;