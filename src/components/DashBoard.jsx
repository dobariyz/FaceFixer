import "./dashboard.css";  
import { useState, useEffect } from "react";  // Import useEffect
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar"; 
import Footer from "./Footer";
import backgroundImage from "/src/assets/background.png";


{/* <button className="dashboard-uploadImage" onClick={() => setShowHistory(!showHistory)}>
  {showHistory ? "Hide History" : "View History"}
</button> */}


const Dashboard = () => {
  const navigate = useNavigate();
   
  const [selectedFile, setSelectedFile] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Token handling on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    // If token is found in URL, store it in localStorage and clean the URL
    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState(null, "", "/dashboard"); // Clean the URL by removing the token
    } else {
      // If token is not in URL, check if it's in localStorage
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        alert("Authentication token missing. Please log in again.");
        navigate("/"); // Redirect to login if no token is found
      }
    }
  }, [navigate]);

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

    // try {
    //   const response = await fetch("http://localhost:5000/api/detect", {
    //     method: "POST", 
    //     body: formData,
    //     headers: {
    //       "Authorization": `Bearer ${token}`, // Send token with request
    //     },
    //   });

    //   const imageUrl = await response.text();
    //   setProcessedImage(`http://localhost:5000${imageUrl}`);
    // } catch (error) {
    //   console.error("Error uploading file:", error);
    // } finally {
    //   setIsProcessing(false);
    // }
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
} finally {
  setIsProcessing(false);
}

  };

  return (
    <div className="dashboard-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <Navbar />
      <div className="dashboard-content">
        {/* Punchlines */}
        <h2>We go beyond the surface to identify the cause of your face problems.</h2>
        <p>
          There may be a variety of reasons you're breaking out. We discover the underlying
          issue to provide a targeted, customized treatment plan.
        </p>

        <div className="image-preview-container">
          {/* Uploaded Image */}
          <div className="image-section">
            <h3>Uploaded Image</h3>
            {selectedFile ? (
              <img src={URL.createObjectURL(selectedFile)} alt="Uploaded" className="image-preview" />
            ) : (
              <div className="processing-placeholder">No Image Selected</div>
            )}
            <input type="file" onChange={handleFileChange} className="file-input" />
          </div>

          {/* Processed Image */}
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

        <button className="dashboard-uploadImage" onClick={handleUpload}>Let's detect</button>
        <button className="dashboard-uploadImage" onClick={() => setShowHistory(!showHistory)}>
  {showHistory ? "Hide History" : "View History"}
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
      <Footer />
    </div>
  );
};

export default Dashboard;
