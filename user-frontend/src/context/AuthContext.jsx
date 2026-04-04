import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    if (token) {
      axios.get('http://127.0.0.1:8000/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setUser(res.data))
      .catch(err => {
        console.error("Auth me error:", err);
        logout();
      });
    } else {
      setUser(null);
    }
  }, [token]);

  const checkAuth = async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;
    try {
      const res = await axios.get('http://127.0.0.1:8000/auth/me', {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      setUser(res.data);
    } catch {
      logout();
    }
  };

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
