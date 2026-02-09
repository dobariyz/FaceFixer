// SessionContext.js
import { createContext, useState, useEffect } from "react";

export const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const userEmail = localStorage.getItem("userEmail");
  const sessionKey = userEmail ? `sessionData_${userEmail}` : null;

  // Initialize only if a valid user exists
  const [sessionData, setSessionData] = useState(() => {
    if (!sessionKey) return { selectedFile: null, processedImage: null, history: [] };
    const saved = sessionStorage.getItem(sessionKey);
    return saved
      ? JSON.parse(saved)
      : { selectedFile: null, processedImage: null, history: [] };
  });

  // Persist user-specific session data
  useEffect(() => {
    if (!sessionKey) return;
    sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));
  }, [sessionData, sessionKey]);

  // 🔒 Securely clear session for ALL users
  const clearSession = () => {
    try {
      // Remove ALL user-specific sessionData keys
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("sessionData_")) {
          sessionStorage.removeItem(key);
        }
      });

      // Also clear entire session storage just in case
      sessionStorage.clear();

      // Clear all user-related localStorage info
      localStorage.removeItem("userEmail");
      localStorage.removeItem("token");

      // Reset in-memory session state
      setSessionData({ selectedFile: null, processedImage: null, history: [] });

      console.log("✅ Session cleared completely.");
    } catch (err) {
      console.error("❌ Error clearing session:", err);
    }
  };

  return (
    <SessionContext.Provider value={{ sessionData, setSessionData, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
};
