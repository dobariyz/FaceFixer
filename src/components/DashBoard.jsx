import "./dashboard.css";  
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { SessionContext } from "./SessionContext";
import Navbar from "./Navbar"; 
import Footer from "./Footer";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const { sessionData, setSessionData, clearSession } = useContext(SessionContext);
  const { selectedFile, processedImage, history } = sessionData;
  const historyRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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
        setSessionData({
          ...sessionData,
          history: data,
        });

        setTimeout(() => {
          historyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 300);

      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    fetchHistory();
  }, [showHistory]);

  // Start camera
const startCamera = async () => {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false, // just to be safe
    });

    setStream(mediaStream);
    setShowCamera(true);

    // Wait a moment for the video element to mount before assigning stream
    setTimeout(async () => {
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        try {
          await videoRef.current.play();
        } catch (err) {
          console.error("Video playback failed:", err);
        }
      }
    }, 200);
  } catch (error) {
    console.error("Error accessing camera:", error);
    alert("Unable to access camera. Please check permissions or try another browser.");
  }
};


  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  // Capture photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        setSessionData({ ...sessionData, selectedFile: file });
        stopCamera();
      }, 'image/jpeg', 0.95);
    }
  };

  // Clean up camera on unmount
 useEffect(() => {
  return () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };
}, []);


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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    clearSession();
    sessionStorage.clear();
    navigate("/login");
    window.location.reload();
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      
      {/* Camera Modal */}
      {showCamera && (
        <div className="camera-modal-overlay" onClick={stopCamera}>
          <div className="camera-modal" onClick={(e) => e.stopPropagation()}>
            <div className="camera-header">
              <h3 className="camera-title">Take a Photo</h3>
              <button className="camera-close" onClick={stopCamera}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="camera-body">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline
                muted
                style={{ width: '100%', height: 'auto', objectFit: 'cover'}}
                className="camera-video"
              />
              <div className="camera-overlay">
                <div className="camera-guide"></div>
                <div className  ="camera-instructions">
                    <h4>Position your face inside the oval</h4>
                    <p>Ensure good lighting and remove glasses for best accuracy.</p>
                </div>
              </div>
            </div>
            
            <div className="camera-footer">
              <button className="camera-btn-cancel" onClick={stopCamera}>
                Cancel
              </button>
              <button className="camera-btn-capture" onClick={capturePhoto}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="dashboard-container">
        <div className="dashboard-main">
          {/* Hero Section */}
          <section className="hero-section">
            <h1 className="hero-title">
              Smart Skin <span className="hero-title-accent">Checking,</span>
              <br />Smarter Care.
            </h1>
            <p className="hero-description">
              We go beyond the surface to identify the cause of your face problems.
              Discover underlying issues to provide targeted, customized treatment plans.
            </p>
          </section>

          {/* Upload Section */}
          <section className="upload-section">
            <div className="upload-grid">
              {/* Uploaded Image Card */}
              <div className="upload-card">
                <div className="card-header">
                  <h3 className="card-title">Uploaded Image</h3>
                </div>
                <div className="card-body">
                  <div className="image-display">
                    {selectedFile instanceof File ? (
                      <img src={URL.createObjectURL(selectedFile)} alt="Uploaded" className="preview-image" />
                    ) : selectedFile && typeof selectedFile === "string" ? (
                      <img src={selectedFile} alt="Uploaded" className="preview-image" />
                    ) : (
                      <div className="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <p>No Image Selected</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-footer">
                  <label className="file-input-label">
                    <input 
                      type="file" 
                      onChange={handleFileChange} 
                      className="file-input-hidden" 
                      accept="image/*" 
                    />
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    Choose File
                  </label>
                  
                  <button className="camera-input-button" onClick={startCamera}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                    Take Photo
                  </button>
                </div>
              </div>

              {/* Processed Image Card */}
              <div className="upload-card">
                <div className="card-header">
                  <h3 className="card-title">Processed Image</h3>
                </div>
                <div className="card-body">
                  <div className="image-display">
                    {isProcessing ? (
                      <div className="processing-state">
                        <div className="processing-spinner"></div>
                        <p>Analyzing your skin...</p>
                      </div>
                    ) : processedImage ? (
                      <img src={processedImage} alt="Processed Result" className="preview-image" />
                    ) : (
                      <div className="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="12" y1="18" x2="12" y2="12"></line>
                          <line x1="9" y1="15" x2="15" y2="15"></line>
                        </svg>
                        <p>No Processed Image</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button 
              className="btn-detect" 
              onClick={handleUpload} 
              disabled={isProcessing || !selectedFile}
            >
              {isProcessing ? 'Processing...' : "Get Started"}
            </button>
          </section>

          {/* What Makes Us Different Section */}
          <section className="features-section">
            <div className="features-header">
              <h2 className="features-title">
                What Makes Us <span className="features-title-accent">Different?</span>
              </h2>
            </div>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-badge">ML-Powered Analysis</div>
                <div className="feature-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                </div>
                <h3 className="feature-heading">Advanced Detection</h3>
                <p className="feature-description">
                  Our ML technology analyzes your skin at a deeper level, identifying issues that aren't visible to the naked eye.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-badge">Personalized Care</div>
                <div className="feature-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h3 className="feature-heading">Tailored Solutions</h3>
                <p className="feature-description">
                  Get customized treatment recommendations based on your unique skin concerns and conditions.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-badge">Dermatologist-Approved</div>
                <div className="feature-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h3 className="feature-heading">Expert Validated</h3>
                <p className="feature-description">
                  Our detection algorithms are validated by dermatologists to ensure accuracy and reliability.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-badge">Safe & Secure</div>
                <div className="feature-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <h3 className="feature-heading">Privacy First</h3>
                <p className="feature-description">
                  Your data is encrypted and secure. We never share your personal information or images.
                </p>
              </div>
            </div>
          </section>

          {/* History Section */}
          {showHistory && (
              <section className="history-section" ref={historyRef}>
              <h2 className="section-title">Your Detection History</h2>
              {history.length === 0 ? (
                <div className="empty-history">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <p>No detection history found</p>
                </div>
              ) : (
                <div className="history-grid">
                  {history.map((item) => (
                    <div key={item.id} className="history-card">
                      <div className="history-images">
                        <div className="history-image-item">
                          <span className="image-label">Original</span>
                          <img
                            src={`http://localhost:5000/api/image?file=${item.imagePath}`}
                            alt="Uploaded"
                            className="history-img"
                          />
                        </div>
                        <div className="history-image-item">
                          <span className="image-label">Detected</span>
                          <img
                            src={`http://localhost:5000/api/image?file=${item.resultPath}`}
                            alt="Detected"
                            className="history-img"
                          />
                        </div>
                      </div>
                      <div className="history-meta">
                        <p className="history-date">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteHistory(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <h3 className="sidebar-title">Quick Actions</h3>
          
          <div className="sidebar-actions">
            <button 
              className="sidebar-btn" 
              onClick={() => setShowHistory(!showHistory)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              {showHistory ? "Hide History" : "View History"}
            </button>

            <button
              className="sidebar-btn"
              onClick={() => navigate("/recommendations")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              Recommendations
            </button>

            <button
              className="sidebar-btn"
              onClick={() => navigate("/detection-chart")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              Detection Report
            </button>
          </div>

          <div className="sidebar-tips">
            <h4 className="tips-title">Tips for Best Results</h4>
            <ul className="tips-list">
              <li>Use clear, well-lit photos</li>
              <li>Face the camera directly</li>
              <li>Remove makeup if possible</li>
              <li>Ensure face is fully visible</li>
            </ul>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;