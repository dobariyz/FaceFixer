import React from 'react';
import './UsageCounter.css';

const UsageCounter = ({ uploadsUsed, uploadsLimit, tier, onUpgradeClick }) => {
  // Calculate percentage
  const percentage = (uploadsUsed / uploadsLimit) * 100;
  
  // Determine color based on usage
  const getStatusColor = () => {
    if (uploadsUsed >= uploadsLimit) return 'red'; // 5/5 - Red
    if (uploadsUsed >= uploadsLimit - 1) return 'yellow'; // 4/5 - Yellow
    return 'green'; // 0-3/5 - Green
  };

  const statusColor = getStatusColor();
  const remaining = uploadsLimit - uploadsUsed;
  const isLimitReached = uploadsUsed >= uploadsLimit;

  return (
    <div className="usage-counter">
      <div className="usage-header">
        <h4 className="usage-title">Upload Usage</h4>
        <span className={`usage-badge usage-badge-${tier}`}>
          {tier.toUpperCase()}
        </span>
      </div>

      {/* Progress Circle */}
      <div className="usage-circle-container">
        <svg className="usage-circle" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            className="usage-circle-bg"
            cx="60"
            cy="60"
            r="52"
          />
          {/* Progress circle */}
          <circle
            className={`usage-circle-progress usage-circle-${statusColor}`}
            cx="60"
            cy="60"
            r="52"
            style={{
              strokeDasharray: `${percentage * 3.27} 327`,
              transform: 'rotate(-90deg)',
              transformOrigin: '60px 60px'
            }}
          />
        </svg>
        <div className="usage-circle-text">
          <span className={`usage-number usage-number-${statusColor}`}>
            {uploadsUsed}
          </span>
          <span className="usage-limit">/ {uploadsLimit}</span>
        </div>
      </div>

      {/* Status Message */}
      <div className={`usage-message usage-message-${statusColor}`}>
        {isLimitReached ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>Limit Reached</span>
          </>
        ) : remaining === 1 ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>{remaining} upload left</span>
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>{remaining} uploads remaining</span>
          </>
        )}
      </div>

      {/* Upgrade CTA (show if free tier or low uploads) */}
      {(tier === 'free' && (isLimitReached || remaining <= 2)) && (
        <button className="usage-upgrade-btn" onClick={onUpgradeClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19V6M5 12l7-7 7 7"/>
          </svg>
          Upgrade to Premium
        </button>
      )}

      {/* Info */}
      {tier === 'free' && !isLimitReached && remaining > 2 && (
        <p className="usage-info">
          Upgrade for 50 uploads/month or go Pro for unlimited!
        </p>
      )}
    </div>
  );
};

export default UsageCounter;