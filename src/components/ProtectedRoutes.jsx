import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const ProtectedRoutes = ({ children }) => {
  const location = useLocation();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(null);
  const [isCheckingTerms, setIsCheckingTerms] = useState(true);

  useEffect(() => {
    const checkAuthAndTerms = async () => {
      // Handle OAuth token from URL parameters
      const urlParams = new URLSearchParams(location.search);
      const tokenFromUrl = urlParams.get("token");
      
      if (tokenFromUrl) {
        localStorage.setItem("token", tokenFromUrl);
        // Clean the URL by removing the token parameter
        const newUrl = location.pathname;
        window.history.replaceState(null, "", newUrl);
      }
      
      const token = localStorage.getItem('token');
      
      if (token) {
        // Check if user has accepted terms
        try {
          const response = await fetch('http://localhost:5000/auth/check-terms', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setTermsAccepted(data.termsAccepted);
          }
        } catch (error) {
          console.error('Error checking terms:', error);
        }
      }
      
      setIsAuthChecked(true);
      setIsCheckingTerms(false);
    };

    checkAuthAndTerms();
  }, [location]);

  // Wait for auth check to complete
  if (!isAuthChecked || isCheckingTerms) {
    return <div>Loading...</div>;
  }

  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If user hasn't accepted terms, redirect to terms page
  if (termsAccepted === false) {
    return <Navigate to="/terms" replace />;
  }

  return children;
};

export default ProtectedRoutes;