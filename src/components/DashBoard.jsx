import "./dashboard.css";  
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar"; 
import Footer from "./Footer";
import backgroundImage from "/src/assets/background.png";

const Dashboard = () => {
  const navigate = useNavigate();
   
  const [selectedFile, setSelectedFile] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);


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
        setHistory(data);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    fetchHistory();
  }, [showHistory]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
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
      setProcessedImage(`http://localhost:5000${data.processed}`);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error processing image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

 return (
    <div className="dashboard-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <Navbar />
      
      <div className="dashboard-scroll-area">
        <div className="dashboard-content">
          <h2>We go beyond the surface to identify the cause of your face problems.</h2>
          <p>
            There may be a variety of reasons you're breaking out. We discover the underlying
            issue to provide a targeted, customized treatment plan.
          </p>

          <div className="image-preview-container">
  <div className="image-section">
    <h3>Uploaded Image</h3>
    <div className="image-content">
      {selectedFile ? (
        <img src={URL.createObjectURL(selectedFile)} alt="Uploaded" className="image-preview" />
      ) : (
        <div className="processing-placeholder">No Image Selected</div>
      )}
    </div>
    <input type="file" onChange={handleFileChange} className="file-input" accept="image/*" />
  </div>

            <div className="image-section">
              <h3>Processed Image</h3>
              {isProcessing ? (
                <div className="processing-placeholder">Processing...</div>
              ) : processedImage ? (
                <img src={processedImage} alt="Processed Result" className="image-preview" />
              ) : (
                <div className="processing-placeholder">No Processed Image</div>
              )}
            </div>
          </div>

          <button className="dashboard-uploadImage" onClick={handleUpload} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : "Let's detect"}
          </button>

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

      {/* Right Slider Panel */}
      <div className="right-slider">
        <h3 style={{ marginBottom: '20px', fontSize: '1.5rem', color: 'white' }}>Quick Actions</h3>
        
        <button 
          className="dashboard-uploadImage" 
          onClick={() => setShowHistory(!showHistory)}
          style={{ width: '100%', marginBottom: '15px' }}
        >
          {showHistory ? "Hide History" : "View History"}
        </button>

        <button
          className="dashboard-uploadImage"
          onClick={() => navigate("/recommendations")}
          style={{ width: '100%', marginBottom: '15px' }}
        >
          Recommendations
        </button>

        <button
          className="dashboard-uploadImage"
          onClick={() => navigate("/detection-chart")}
          style={{ width: '100%', marginBottom: '15px' }}
        >
          View Detection Report
        </button>

        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          background: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <h4 style={{ marginBottom: '15px', color: 'white', fontSize: '1.1rem' }}>Tips for Best Results</h4>
          <ul style={{ 
            textAlign: 'left', 
            color: 'rgba(255, 255, 255, 0.9)', 
            lineHeight: '1.8',
            paddingLeft: '20px'
          }}>
            <li>Use clear, well-lit photos</li>
            <li>Face the camera directly</li>
            <li>Remove makeup if possible</li>
            <li>Ensure face is fully visible</li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;