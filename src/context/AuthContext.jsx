import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = authService.getStoredUser();
      const token = localStorage.getItem('skillbridge_token');

      if (token && storedUser) {
        setUser(storedUser);
        try {
          const data = await authService.getCurrentUser();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('skillbridge_user', JSON.stringify(data.user));
            console.log('[AUTH] AUTH USER LOADED');
          }
        } catch (err) {
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            console.warn('[AUTH] AUTH TOKEN VALIDATION FAILED: Invalid or expired token. Clearing session.');
            authService.logout();
            setUser(null);
          } else {
            console.warn('[AUTH] Server offline or network error. Preserving local session state for offline resilience.');
          }
        }
      } else {
        authService.logout();
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();

    // Listen for global 401 responses dispatched from API interceptor
    const handleAuthExpired = () => {
      console.warn('[AUTH] AUTH TOKEN VALIDATION FAILED (401 interceptor). Resetting user state.');
      setUser(null);
    };

    window.addEventListener('skillbridge:auth_expired', handleAuthExpired);
    return () => window.removeEventListener('skillbridge:auth_expired', handleAuthExpired);
  }, []);

  const login = async (credentials, passwordArg) => {
    const payload = (typeof credentials === 'object' && credentials !== null)
      ? credentials
      : { email: credentials, password: passwordArg };

    console.log('[AUTH] AUTH LOGIN REQUEST');
    const data = await authService.login(payload);
    if (data.user) {
      setUser(data.user);
      console.log('[AUTH] AUTH LOGIN SUCCESS');
    }
    return data;
  };

  const register = async (userData) => {
    console.log('[AUTH] AUTH REGISTER REQUEST');
    const data = await authService.register(userData);
    if (data.user) {
      setUser(data.user);
      console.log('[AUTH] AUTH REGISTER SUCCESS');
    }
    return data;
  };

  const logout = () => {
    console.log('[AUTH] AUTH LOGOUT');
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
