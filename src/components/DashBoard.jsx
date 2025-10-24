import "./dashboard.css";  
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { SessionContext } from "./SessionContext";
import Navbar from "./Navbar"; 
import Footer from "./Footer";
import backgroundImage from "/src/assets/background.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { sessionData, setSessionData, clearSession } = useContext(SessionContext);
  const { selectedFile, processedImage, history } = sessionData;

  useEffect(() => {
    const fetchHistory = async () => {
      if (!showHistory) return;

      const token = localStorage.getItem("token");
      try {
        const response = await fetch("http://localhost:5000/api/detections/history", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        // Save the history into session context (persistent)
        setSessionData({
          ...sessionData,
          history: data,
        });
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    fetchHistory();
  }, [showHistory]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSessionData({ ...sessionData, selectedFile: file });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsProcessing(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch("http://localhost:5000/api/detect", {
        method: "POST",
        body: formData,
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }
      const data = await response.json();
      setSessionData({
        ...sessionData,
        processedImage: `http://localhost:5000${data.processed}`,
      });

    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error processing image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete history item function
  const handleDeleteHistory = async (id) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:5000/api/detections/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete history");
      }

      // Update the history in session context by removing deleted item
      const updatedHistory = history.filter(item => item.id !== id);
      setSessionData({
        ...sessionData,
        history: updatedHistory,
      });

      alert("Detection history deleted successfully");
    } catch (error) {
      console.error("Error deleting history:", error);
      alert("Error deleting history. Please try again.");
    }
  };

  //  Updated Logout to securely clear per-user session
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail"); // also remove stored user ID/email key
    clearSession();
    sessionStorage.clear(); //  full clear of all session keys
    navigate("/login");
    window.location.reload(); //  ensures context fully resets
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="dashboard-scroll-area">
          <div className="dashboard-content">
            <h2 className="dashboard-main-title">
              We go beyond the surface to identify the cause of your face problems.
            </h2>
            <p className="dashboard-subtitle">
              There may be a variety of reasons you're breaking out. We discover the underlying
              issue to provide a targeted, customized treatment plan.
            </p>

            <div className="image-preview-container">
              <div className="image-section">
                <h3>Uploaded Image</h3>
                <div className="image-content">
                  {selectedFile instanceof File ? (
                    <img src={URL.createObjectURL(selectedFile)} alt="Uploaded" className="image-preview" />
                  ) : selectedFile && typeof selectedFile === "string" ? (
                    <img src={selectedFile} alt="Uploaded" className="image-preview" />
                  ) : (
                    <div className="processing-placeholder">No Image Selected</div>
                  )}
                </div>
                <input type="file" onChange={handleFileChange} className="file-input" accept="image/*" />
              </div>

              <div className="image-section">
                <h3>Processed Image</h3>
                <div className="image-content">
                  {isProcessing ? (
                    <div className="processing-placeholder">Processing...</div>
                  ) : processedImage ? (
                    <img src={processedImage} alt="Processed Result" className="image-preview" />
                  ) : (
                    <div className="processing-placeholder">No Processed Image</div>
                  )}
                </div>
              </div>
            </div>

            <button className="dashboard-uploadImage" onClick={handleUpload} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : "Let's detect"}
            </button>

            {showHistory && (
              <div className="history-section">
                <h3>Your Detection History</h3>
                {history.length === 0 ? (
                  <p className="empty-history">No history found.</p>
                ) : (
                  <div className="history-grid">
                    {history.map((item) => (
                      <div key={item.id} className="history-item">
                        <p><strong>Uploaded:</strong></p>
                        <img
                          src={`http://localhost:5000/api/image?file=${item.imagePath}`}
                          alt="Uploaded"
                          className="history-image"
                        />
                        <p><strong>Detected:</strong></p>
                        <img
                          src={`http://localhost:5000/api/image?file=${item.resultPath}`}
                          alt="Detected"
                          className="history-image"
                        />
                        <p><strong>Date:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                        <button 
                          className="delete-history-btn"
                          onClick={() => handleDeleteHistory(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Slider Panel */}
        <div className="right-slider">
          <h3 className="slider-title">Quick Actions</h3>
          
          <button 
            className="slider-button" 
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "Hide History" : "View History"}
          </button>

          <button
            className="slider-button"
            onClick={() => navigate("/recommendations")}
          >
            Recommendations
          </button>

          <button
            className="slider-button"
            onClick={() => navigate("/detection-chart")}
          >
            View Detection Report
          </button>

          <div className="slider-tips">
            <h4>Tips for Best Results</h4>
            <ul>
              <li>Use clear, well-lit photos</li>
              <li>Face the camera directly</li>
              <li>Remove makeup if possible</li>
              <li>Ensure face is fully visible</li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;