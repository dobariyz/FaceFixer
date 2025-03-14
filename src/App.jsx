import { useNavigate } from "react-router-dom";
import Navbar from "./components/HomeNavbar";
import Footer from "./components/Footer";
import "./components/homePage.css"; // Assuming you'll have some styling for the home page

const App = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />

      <div className="home-container">
        <h1 className="welcome-message">Welcome to FaceFixer</h1>
        <p className="home-description">Your one-stop solution for skin analysis and care. Explore our features and get started today!</p>
      </div>

      <Footer />
    </div>
  );
};

export default App;
