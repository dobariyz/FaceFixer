import React from 'react';
import './WarningBanner.css';

const WarningBanner = ({ uploadsRemaining, onUpgradeClick, onDismiss }) => {
  if (uploadsRemaining > 1) return null; // Only show when 1 or 0 uploads left

  return (
    <div className={`warning-banner ${uploadsRemaining === 0 ? 'warning-banner-critical' : ''}`}>
      <div className="warning-banner-content">
        <div className="warning-banner-icon">
          {uploadsRemaining === 0 ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          )}
        </div>

        <div className="warning-banner-text">
          <strong>
            {uploadsRemaining === 0 ? 'Upload Limit Reached!' : `⚠️ Only ${uploadsRemaining} upload remaining this month`}
          </strong>
          <p>
            {uploadsRemaining === 0 
              ? 'Upgrade to Premium for 50 uploads/month or Pro for unlimited uploads!'
              : 'Upgrade now to get 50 uploads/month (Premium) or unlimited (Pro)'}
          </p>
        </div>

        <div className="warning-banner-actions">
          <button className="warning-banner-btn warning-banner-btn-upgrade" onClick={onUpgradeClick}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V6M5 12l7-7 7 7"/>
            </svg>
            Upgrade Now
          </button>
          {uploadsRemaining > 0 && onDismiss && (
            <button className="warning-banner-btn warning-banner-btn-dismiss" onClick={onDismiss}>
              Dismiss
            </button>
          )}
        </div>
      </div>

      {/* Close button (for critical banner) */}
      {uploadsRemaining === 0 && onDismiss && (
        <button className="warning-banner-close" onClick={onDismiss}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
};

export default WarningBanner;