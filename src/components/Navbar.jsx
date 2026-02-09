import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css"; // Import the separate Navbar.css file

const Navbar = ({ onUpgradeClick }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const settingsRef = useRef(null);

  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });

  const [subscription, setSubscription] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchSubscriptionData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:5000/auth/user-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const fullName = `${data.firstName} ${data.lastName}`;
        setUserName(fullName);
        setUserProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchSubscriptionData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:5000/api/subscription/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/auth/update-profile", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userProfile)
      });

      if (response.ok) {
        alert("Profile updated successfully!");
        setUserName(`${userProfile.firstName} ${userProfile.lastName}`);
        setShowSettingsModal(false);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription? You'll lose premium features at the end of your billing period.")) {
      return;
    }

    setIsCancelling(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/subscription/cancel", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert("Subscription cancelled successfully. You'll retain access until the end of your billing period.");
        fetchSubscriptionData();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      alert("Error cancelling subscription. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  // ✅ FIXED: Upgrade handler that directly creates checkout
  const handleUpgradeClick = async (tier) => {
    console.log("🚀 Upgrade clicked for tier:", tier);
    setShowSettingsModal(false);
    setShowSettings(false);
    
    // Close the modal first
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Directly create checkout and redirect
    await handleCreateCheckout(tier);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a search term.");
      return;
    }

    setError("");
    setLoading(true);
    setShowResults(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/search?query=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) throw new Error("Failed to fetch products.");

      const data = await response.json();
      setSearchResults(data);
      
      if (data.length === 0) {
        setError("No products found. Try different keywords!");
      }
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const closeResults = () => {
    setShowResults(false);
    setSearchResults([]);
    setError("");
  };

  const getSephoraSearchUrl = (item) => {
    const brandName = item.brand || "";
    const productName = item.name || "";
    const searchTerm = encodeURIComponent(`${brandName} ${productName}`);
    return `https://www.sephora.com/ca/en/search?keyword=${searchTerm}`;
  };

  // ✅ NEW: Direct checkout handler (moved up before other functions)
  const handleCreateCheckout = async (tier) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to upgrade");
      navigate("/");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/payment/create-checkout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tier })
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to create checkout session");
        return;
      }

      const data = await response.json();
      console.log("✅ Checkout session created:", data.sessionId);
      
      // Redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      alert("Error creating checkout session. Please try again.");
    }
  };

  // ✅ Helper functions for subscription display
  const getCurrentTier = () => {
    if (!subscription) return 'free';
    // If subscription is inactive/cancelled, show free
    if (!subscription.isActive || subscription.tier === 'free') {
      return 'free';
    }
    return subscription.tier;
  };

  const getStatusBadge = () => {
    const currentTier = getCurrentTier();
    
    if (currentTier === 'free') {
      return { text: 'FREE', class: 'tier-badge-free' };
    }
    
    if (subscription.isActive) {
      return { 
        text: subscription.tier.toUpperCase() + ' - ACTIVE', 
        class: subscription.tier === 'premium' ? 'tier-badge-premium' : 'tier-badge-pro' 
      };
    }
    
    return { 
      text: subscription.tier.toUpperCase() + ' - CANCELLED', 
      class: 'tier-badge-cancelled' 
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanFeatures = (tier) => {
    const features = {
      free: [
        '5 uploads per month',
        'Basic face detection',
        'Standard processing speed',
        'Community support'
      ],
      premium: [
        '50 uploads per month',
        'Advanced face detection',
        '30-day history retention',
        'Priority processing',
        'Downloadable reports'
      ],
      pro: [
        'Unlimited uploads',
        'All Premium features',
        'Lifetime history retention',
        'API access',
        'Priority support'
      ]
    };
    return features[tier] || features.free;
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <h1 className="brand-logo">FaceFixer</h1>
        </div>

        <div className="navbar-search">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="search-icon-btn" aria-label="Search" onClick={handleSearch}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="navbar-actions">
          <div className="settings-dropdown" ref={settingsRef}>
            <button 
              className="settings-trigger"
              onClick={() => setShowSettings(!showSettings)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m5.196-15.804L13.804 6.59M10.196 17.41l-3.392 3.393M1 12h6m6 0h6m-15.804 5.196 3.393-3.393M17.41 10.196l3.393-3.392"></path>
              </svg>
            </button>

            {showSettings && (
              <div className="settings-dropdown-menu">
                <button 
                  className="settings-menu-item"
                  onClick={() => {
                    setShowSettingsModal('profile');
                    setShowSettings(false);
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Edit Profile
                </button>
                
                <button 
                  className="settings-menu-item"
                  onClick={() => {
                    setShowSettingsModal('subscription');
                    setShowSettings(false);
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Manage Subscription
                </button>
                
                <div className="settings-menu-divider"></div>
                
                <button className="settings-menu-item settings-menu-item-danger" onClick={handleLogout}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Log Out
                </button>
              </div>
            )}
          </div>

          <div className="user-profile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span className="user-name-text">{userName}</span>
          </div>
        </div>
      </nav>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-backdrop" onClick={() => setShowSettingsModal(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {showSettingsModal === 'profile' ? 'Edit Profile' : 'Manage Subscription'}
              </h2>
              <button className="btn-close" onClick={() => setShowSettingsModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="settings-modal-body">
              {/* Profile Section */}
              {showSettingsModal === 'profile' && (
                <div className="settings-section">
                  <h3 className="settings-section-title">Profile Information</h3>
                  
                  <div className="settings-form">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={userProfile.firstName}
                        onChange={(e) => setUserProfile({...userProfile, firstName: e.target.value})}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={userProfile.lastName}
                        onChange={(e) => setUserProfile({...userProfile, lastName: e.target.value})}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-input"
                        value={userProfile.email}
                        onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                      />
                    </div>

                    <button 
                      className="btn-save-profile"
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <span className="btn-spinner"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                          </svg>
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ✅ FIXED: Subscription Section */}
              {showSettingsModal === 'subscription' && subscription && (
                <div className="settings-section">
                  {/* Current Plan Card */}
                  <div className="subscription-plan-card">
                    <div className="plan-card-header">
                      <div>
                        <h3 className="plan-card-title">Current Plan</h3>
                        <span className={`tier-badge ${getStatusBadge().class}`}>
                          {getStatusBadge().text}
                        </span>
                      </div>
                    </div>

                    {/* Plan Stats Grid */}
                    <div className="plan-stats-grid">
                      <div className="plan-stat-box">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7"></rect>
                          <rect x="14" y="3" width="7" height="7"></rect>
                          <rect x="14" y="14" width="7" height="7"></rect>
                          <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        <div>
                          <p className="stat-label">Plan Name</p>
                          <p className="stat-value">{getCurrentTier().toUpperCase()}</p>
                        </div>
                      </div>

                      <div className="plan-stat-box">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <div>
                          <p className="stat-label">Uploads Remaining</p>
                          <p className="stat-value">{subscription.uploadsRemaining} / {subscription.uploadsLimit}</p>
                        </div>
                      </div>

                      <div className="plan-stat-box">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <div>
                          <p className="stat-label">
                            {subscription.isActive ? 'Next Billing Date' : 'Access Until'}
                          </p>
                          <p className="stat-value">
                            {subscription.resetDate ? formatDate(subscription.resetDate) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Plan Features */}
                    <div className="plan-features-section">
                      <h4 className="plan-features-title">What you get with {getCurrentTier().toUpperCase()}:</h4>
                      <ul className="plan-features-list">
                        {getPlanFeatures(getCurrentTier()).map((feature, index) => (
                          <li key={index} className="plan-feature-item">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Upgrade Options or Cancel Button */}
                  {getCurrentTier() === 'free' ? (
                    <>
                      <h3 className="settings-section-title" style={{marginTop: '24px'}}>
                        Upgrade Your Plan
                      </h3>
                      <div className="upgrade-options">
                        {/* Premium Option */}
                        <div className="upgrade-option-card">
                          <div className="upgrade-option-header">
                            <h4>Premium</h4>
                            <span className="upgrade-option-badge">Most Popular</span>
                          </div>
                          <div className="upgrade-option-price">
                            <span className="price-currency">$</span>
                            <span className="price-amount">9.99</span>
                            <span className="price-period">/month</span>
                          </div>
                          <ul className="upgrade-option-features">
                            <li>✓ 50 uploads per month</li>
                            <li>✓ Advanced detection</li>
                            <li>✓ Priority processing</li>
                            <li>✓ 30-day history</li>
                          </ul>
                          <button 
                            className="btn-upgrade-option"
                            onClick={() => handleUpgradeClick('premium')}
                          >
                            Upgrade to Premium
                          </button>
                        </div>

                        {/* Pro Option */}
                        <div className="upgrade-option-card upgrade-option-card-pro">
                          <div className="upgrade-option-header">
                            <h4>Pro</h4>
                            <span className="upgrade-option-badge upgrade-option-badge-gold">Best Value</span>
                          </div>
                          <div className="upgrade-option-price">
                            <span className="price-currency">$</span>
                            <span className="price-amount">19.99</span>
                            <span className="price-period">/month</span>
                          </div>
                          <ul className="upgrade-option-features">
                            <li>✓ Unlimited uploads</li>
                            <li>✓ All Premium features</li>
                            <li>✓ API access</li>
                            <li>✓ Lifetime history</li>
                          </ul>
                          <button 
                            className="btn-upgrade-option btn-upgrade-option-pro"
                            onClick={() => handleUpgradeClick('pro')}
                          >
                            Upgrade to Pro
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="subscription-actions" style={{marginTop: '20px'}}>
                      {subscription.isActive && (
                        <button 
                          className="btn-cancel-subscription"
                          onClick={handleCancelSubscription}
                          disabled={isCancelling}
                        >
                          {isCancelling ? (
                            <>
                              <span className="btn-spinner"></span>
                              Cancelling...
                            </>
                          ) : (
                            <>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                              </svg>
                              Cancel Subscription
                            </>
                          )}
                        </button>
                      )}
                      {!subscription.isActive && (
                        <p className="cancellation-notice">
                          Your subscription has been cancelled. You can still use {subscription.tier} features until {formatDate(subscription.resetDate)}.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Results Modal */}
      {showResults && (
        <div className="modal-backdrop" onClick={closeResults}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Search Results</h2>
              <button className="btn-close" onClick={closeResults}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {loading && (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Finding the best products for you...</p>
                </div>
              )}

              {error && !loading && (
                <div className="error-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <p>{error}</p>
                </div>
              )}

              {!loading && !error && searchResults.length > 0 && (
                <div className="products-grid">
                  {searchResults.map((item, index) => (
                    <div key={index} className="product-card">
                      <div className="product-img-wrapper">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="product-img" />
                        ) : (
                          <div className="product-img-placeholder">No Image</div>
                        )}
                      </div>
                      <div className="product-details">
                        <p className="product-brand">{item.brand}</p>
                        <h3 className="product-title">{item.name}</h3>
                        <div className="product-meta">
                          <span className="product-price">{item.price}</span>
                          {item.rating && (
                            <span className="product-rating">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                              {item.rating}
                            </span>
                          )}
                        </div>
                        <a 
                          href={getSephoraSearchUrl(item)}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-view-product"
                        >
                          View on Sephora
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;