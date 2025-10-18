import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userDataRaw = localStorage.getItem("user");
    if (userDataRaw) {
      try {
        const userData = JSON.parse(userDataRaw);
        setUser(userData);
      } catch (e) {
        console.error("Failed to parse user JSON", e);
      }
    }
  }, []);

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
