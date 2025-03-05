import "./dashboard.css";  //Import the new CSS file
import Navbar from "./Navbar"; 
import backgroundImage from "/src/assets/background.png";  

const Dashboard = () => {
  return (
    <div className="dashboard-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <Navbar />
      <div className="dashboard-content">
        <h1>Welcome to the Dashboard</h1>
        <p>You have successfully logged in.</p>
        <button className="dashboard-button">Upload Your Image</button>
      </div>
    </div>
  );
};

export default Dashboard;
