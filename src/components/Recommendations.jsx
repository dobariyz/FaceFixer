import React, { useEffect, useState } from 'react';
import "./recommendations.css";

const Recommendations = () => {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('token');
        
        console.log('🔑 Token:', token ? 'Found' : 'Not found');
        
        if (!token) {
          setError('Please log in to view recommendations');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:5000/api/recommendations', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Fetched data:', data);
        
        setProducts(data || {});
        setLoading(false);
      } catch (err) {
        console.error('❌ Error:', err);
        
        if (err.message.includes('401')) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
        } else {
          setError('Failed to load recommendations');
        }
        
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // ✅ Create Sephora search URL with product name (same as navbar)
  const getSephoraSearchUrl = (product) => {
    const brandName = product.brand || "";
    const productName = product.name || "";
    const searchTerm = encodeURIComponent(`${brandName} ${productName}`);
    
    // Canadian Sephora with auto-search
    return `https://www.sephora.com/ca/en/search?keyword=${searchTerm}`;
  };

  if (loading) {
    return (
      <div className="recommendations-container">
        <div className="loading-wrapper">
          <div className="spinner"></div>
          <p className="loading-text">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendations-container">
        <div className="error-card">
          <h3 className="error-title">Error</h3>
          <p className="error-message">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <div className="recommendations-wrapper">
        <div className="header-section">
          <h1 className="main-title">
            Your Personalized Recommendations
          </h1>
          <p className="subtitle">
            Products tailored to your skin concerns
          </p>
        </div>

        {Object.keys(products).length === 0 && (
          <div className="empty-state">
            <p className="empty-message">No recommendations found.</p>
          </div>
        )}

        {Object.keys(products).map((keyword) => {
          const productList = products[keyword];
          
          if (!productList || !Array.isArray(productList) || productList.length === 0) {
            return null;
          }
          
          return (
            <div key={keyword} className="category-section">
              <div className="category-header">
                <div className="divider-line"></div>
                <h2 className="category-title">{keyword}</h2>
                <div className="divider-line"></div>
              </div>

              <div className="products-grid">
                {productList.map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="product-image-wrapper">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/270?text=No+Image';
                        }}
                      />
                    </div>

                    <div className="product-content">
                      <p className="product-brand">{product.brand}</p>

                      <h3 className="product-name">{product.name}</h3>

                      <div className="product-footer">
                        <p className="product-price">{product.price}</p>
                        {/* ✅ Fixed: Now uses smart search URL instead of broken product URL */}
                        <a
                          href={getSephoraSearchUrl(product)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="product-button"
                        >
                          View
                          <svg
                            className="button-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Recommendations;