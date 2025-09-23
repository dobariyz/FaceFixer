import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const ProtectedRoutes = ({ children }) => {
  const location = useLocation();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    // Handle OAuth token from URL parameters
    const urlParams = new URLSearchParams(location.search);
    const tokenFromUrl = urlParams.get("token");
    
    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      // Clean the URL by removing the token parameter
      const newUrl = location.pathname;
      window.history.replaceState(null, "", newUrl);
    }
    
    setIsAuthChecked(true);
  }, [location]);

  // Wait for auth check to complete
  if (!isAuthChecked) {
    return <div>Loading...</div>;
  }

  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoutes;