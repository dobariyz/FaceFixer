import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("http://localhost:5000/auth/user-profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar">
      {/* Left: Company Name */}
      <div className="navbar-left">
        <h2 className="company-name">FaceFixer</h2>
      </div>

      {/* Center: Search Bar */}
      <div className="navbar-center">
        <div className="search-bar">
          <input type="text" placeholder="What are you looking for?" />
          <button className="search-button" aria-label="Search">🔍</button>
        </div>
      </div>

      {/* Right: User Name & Logout Button */}
      <div className="navbar-right">
        <span className="user-name">{userName}</span>
        <button className="logout-button" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;