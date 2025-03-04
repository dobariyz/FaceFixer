import "./dashboard.css";  // ✅ Import the new CSS file
import Navbar from "./Navbar";  

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="dashboard-content">
        <h1>Welcome to the Dashboard</h1>
        <p>You have successfully logged in.</p>
      </div>
    </div>
  );
};

export default Dashboard;
