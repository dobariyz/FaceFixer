import { useNavigate } from "react-router-dom";
import "./homeNavbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      {/* Left: Company Name */}
      <div className="navbar-left">
        <h2 className="company-name">FaceFixer</h2>
      </div>

      {/* Center: Search Bar */}
      <div className="search-bar">
        <input type="text" placeholder="What are you looking for?" />
        <button className="search-button">🔍</button>
      </div>

      {/* Right: Login & Signup Buttons */}
      <div className="navbar-right">
        <button className="login-button" onClick={() => navigate("/login")}>
          Log In
        </button>
        <button className="signup-button" onClick={() => navigate("/signup")}>
          Sign Up
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
