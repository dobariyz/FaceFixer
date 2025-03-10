import "./dashboard.css";  //Import the new CSS file
import Navbar from "./Navbar"; 
import Footer from "./Footer";
import backgroundImage from "/src/assets/background.png";
//import userImage from "/src/assets/background.png";

// const Dashboard = () => {
//   return (
//     <div className="dashboard-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
//       <Navbar />
//       <div className="dashboard-content">
//         <div className="info-card">
//           {/* Left Side - Text Section */}
//           <div className="info-section">
//             <h2>We go beyond the surface to identify the cause of your face problems.</h2>
//             <p>
//               There may be a variety of reasons you're breaking out. We discover the underlying 
//               issue to provide a targeted, customized treatment plan.
//             </p>



//             <button className="dashboard-uploadImage">Upload Your Image</button>
//           </div>
//           </div>
//           </div>

//       <Footer />
//     </div>
//   );
// };


const Dashboard = () => {
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
