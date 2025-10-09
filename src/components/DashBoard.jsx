import "./dashboard.css"; // Import the new CSS file
import Navbar from "./Navbar";
import Footer from "./Footer";
import backgroundImage from "/src/assets/background.png";
import React, { useRef, useState } from "react";

const Dashboard = () => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleButtonClick = () => {
    fileInputRef.current.click(); // Trigger file input click
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file.name);
      console.log("Selected file:", file.name);
    }
  };

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
            <button className="dashboard-uploadImage" onClick={handleButtonClick}>Upload Your Image</button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {selectedFile && <p>Selected File: {selectedFile}</p>}
          </div>

          {showHistory && (
            <div className="history-section">
              <h3>Your Detection History</h3>
              {history.length === 0 ? (
                <p>No history found.</p>
              ) : (
                <div className="history-grid">
                  {history.map((item, index) => (
                    <div key={index} className="history-item">
                      <p><strong>Uploaded:</strong></p>
                      <img
                        src={`http://localhost:5000/api/image?file=${item.imagePath}`}
                        alt="Uploaded"
                        className="image-preview"
                      />
                      <p><strong>Detected:</strong></p>
                      <img
                        src={`http://localhost:5000/api/image?file=${item.resultPath}`}
                        alt="Detected"
                        className="image-preview"
                      />
                      <p><strong>Date:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;