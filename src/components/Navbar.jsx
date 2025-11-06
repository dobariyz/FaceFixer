import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
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
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, []);

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
          <div className="user-profile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span className="user-name-text">{userName}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </nav>

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