/**
 * context/AuthContext.js — Global authentication state.
 * Provides user, token, login(), logout() to the entire app.
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { initSocket, disconnectSocket } from "../utils/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // True while checking localStorage

  // ─── Restore session from localStorage on mount ──────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem("chatapp_token");
    const storedUser = localStorage.getItem("chatapp_user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        // Re-connect socket with stored token
        initSocket(storedToken);
      } catch {
        // Invalid stored data — clear it
        localStorage.removeItem("chatapp_token");
        localStorage.removeItem("chatapp_user");
      }
    }
    setLoading(false);
  }, []);

  /**
   * Called after successful login/register API response.
   */
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("chatapp_token", authToken);
    localStorage.setItem("chatapp_user", JSON.stringify(userData));
    initSocket(authToken); // Connect socket with new token
  };

  /**
   * Clears all auth state and disconnects socket.
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("chatapp_token");
    localStorage.removeItem("chatapp_user");
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy consumption
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
