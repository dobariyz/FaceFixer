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

  // ✅ Create Sephora search URL with product name
  const getSephoraSearchUrl = (item) => {
    const brandName = item.brand || "";
    const productName = item.name || "";
    const searchTerm = encodeURIComponent(`${brandName} ${productName}`);
    
    // Canadian Sephora search URL
    return `https://www.sephora.com/ca/en/search?keyword=${searchTerm}`;
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <h2 className="company-name">FaceFixer</h2>
        </div>

        <div className="navbar-center">
          <div className="search-bar">
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="search-button" aria-label="Search" onClick={handleSearch}>
              🔍
            </button>
          </div>
        </div>

        <div className="navbar-right">
          <span className="user-name">👤 {userName}</span>
          <button className="logout-button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </nav>

      {showResults && (
        <div className="search-modal-overlay" onClick={closeResults}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Search Results for "{searchQuery}"</h2>
              <button className="close-button" onClick={closeResults}>✕</button>
            </div>

            <div className="modal-content">
              {loading && (
                <div className="search-status">
                  <div className="spinner"></div>
                  <p>Finding the best products for you...</p>
                </div>
              )}

              {error && !loading && (
                <div className="search-error">
                  <span>⚠️</span>
                  <p>{error}</p>
                </div>
              )}

              {!loading && !error && searchResults.length > 0 && (
                <div className="search-results-grid">
                  {searchResults.map((item, index) => (
                    <div key={index} className="product-card">
                      <div className="product-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="no-image">No Image</div>
                        )}
                      </div>
                      <div className="product-info">
                        <p className="product-brand">{item.brand}</p>
                        <h3 className="product-name">{item.name}</h3>
                        <div className="product-footer">
                          <span className="product-price">{item.price}</span>
                          {item.rating && (
                            <span className="product-rating">⭐ {item.rating}</span>
                          )}
                        </div>
                        
                        {/* ✅ Clean single button that opens Sephora search */}
                        <a 
                          href={getSephoraSearchUrl(item)}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="view-product-btn"
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