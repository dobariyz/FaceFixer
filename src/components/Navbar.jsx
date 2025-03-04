import { useNavigate } from "react-router-dom";
import "./navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const user = {
    name: "Zeel Doabriya",
  };

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
      <div className="search-bar">
        <input type="text" placeholder="What are you looking for?" />
        <button className="search-button">🔍</button>
      </div>

      {/* Right: User Name & Logout Button */}
      <div className="navbar-right">
        <span className="user-name">{user.name}</span>
        <button className="logout-button" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
