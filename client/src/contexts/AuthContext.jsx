// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('userId')
  );

  useEffect(() => {
    const handler = () => setIsLoggedIn(!!localStorage.getItem('userId'));
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const logout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;  // add this line at the end
