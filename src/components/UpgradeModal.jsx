import React, { useState } from 'react';
import './UpgradeModal.css';

const UpgradeModal = ({ isOpen, onClose, currentTier, uploadsUsed, uploadsLimit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState('premium');

  if (!isOpen) return null;

  const handleUpgrade = async (tier) => {
    setIsLoading(true);
    setSelectedTier(tier);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/payment/create-checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tier })
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create checkout session');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="upgrade-modal-overlay" onClick={onClose}>
      <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="upgrade-modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Header */}
        <div className="upgrade-modal-header">
          <div className="upgrade-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h2 className="upgrade-modal-title">Upgrade Your Plan</h2>
          <p className="upgrade-modal-subtitle">
            You've used {uploadsUsed}/{uploadsLimit} uploads. Unlock more with Premium or Pro!
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="upgrade-pricing-grid">
          {/* Premium Plan */}
          <div className="upgrade-pricing-card upgrade-pricing-premium">
            <div className="upgrade-pricing-badge">Most Popular</div>
            <h3 className="upgrade-pricing-title">Premium</h3>
            <div className="upgrade-pricing-price">
              <span className="upgrade-pricing-currency">$</span>
              <span className="upgrade-pricing-amount">9.99</span>
              <span className="upgrade-pricing-period">/month</span>
            </div>

            <ul className="upgrade-pricing-features">
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span><strong>50 uploads</strong> per month</span>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Advanced detection</span>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>30-day history retention</span>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Priority processing</span>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Downloadable reports</span>
              </li>
            </ul>

            <button
              className="upgrade-pricing-btn upgrade-pricing-btn-premium"
              onClick={() => handleUpgrade('premium')}
              disabled={isLoading}
            >
              {isLoading && selectedTier === 'premium' ? (
                <>
                  <span className="upgrade-spinner"></span>
                  Processing...
                </>
              ) : (
                'Upgrade to Premium'
              )}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="upgrade-pricing-card upgrade-pricing-pro">
            <div className="upgrade-pricing-badge upgrade-pricing-badge-pro">Best Value</div>
            <h3 className="upgrade-pricing-title">Pro</h3>
            <div className="upgrade-pricing-price">
              <span className="upgrade-pricing-currency">$</span>
              <span className="upgrade-pricing-amount">19.99</span>
              <span className="upgrade-pricing-period">/month</span>
            </div>

            <ul className="upgrade-pricing-features">
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span><strong>Unlimited uploads</strong></span>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>All Premium features</span>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Lifetime history</span>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>API access</span>
              </li>
              <li>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Priority support</span>
              </li>
            </ul>

            <button
              className="upgrade-pricing-btn upgrade-pricing-btn-pro"
              onClick={() => handleUpgrade('pro')}
              disabled={isLoading}
            >
              {isLoading && selectedTier === 'pro' ? (
                <>
                  <span className="upgrade-spinner"></span>
                  Processing...
                </>
              ) : (
                'Upgrade to Pro'
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="upgrade-modal-footer">
          <p className="upgrade-modal-guarantee">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            30-day money-back guarantee • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;