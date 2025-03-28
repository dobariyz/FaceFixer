  import "./dashboard.css";  //Import the new CSS file
  import { useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import Navbar from "./Navbar"; 
  import Footer from "./Footer";
  import backgroundImage from "/src/assets/background.png";



  const Dashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
      // Extract token from URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
  
      if (token) {
        // Save token in localStorage
        localStorage.setItem("token", token);
  
        // Clean the URL by removing token parameter
        window.history.replaceState(null, "", "/dashboard");
      } else {
        // If no token, send back to login page
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
          navigate("/");
        }
      }
    }, [navigate]);
    
    return (
      <div className="dashboard-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <Navbar />
        <div className="dashboard-content">
          <div className="info-card">
            <div className="info-section">
              <h2>We go beyond the surface to identify the cause of your face problems.</h2>
              <p>
                There may be a variety of reasons you're breaking out. We discover the underlying 
                issue to provide a targeted, customized treatment plan.
              </p>
              <button className="dashboard-uploadImage">Upload Your Image</button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  };

  export default Dashboard;
