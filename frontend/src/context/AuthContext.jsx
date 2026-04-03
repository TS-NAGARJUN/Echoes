/**
 * @file context/AuthContext.jsx
 * @description Authentication context for global auth state management
 * Provides user data, token, and auth functions to entire app
 */

import { createContext, useState, useCallback, useEffect } from 'react';

export const AuthContext = createContext();

/**
 * AuthProvider Component
 * Manages authentication state and provides methods to the entire app
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  /**
   * Store authentication data in state and localStorage
   */
  const storeAuthData = useCallback((userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('authToken', tokenData);
    localStorage.setItem('authUser', JSON.stringify(userData));
  }, []);

  /**
   * Clear all authentication data
   */
  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    clearAuth();
    setError(null);
  }, [clearAuth]);

  const value = {
    user,
    token,
    loading,
    error,
    setLoading,
    setError,
    storeAuthData,
    clearAuth,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
