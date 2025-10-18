import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

export default function RequireAuth({ children }) {
  const { user } = useContext(AuthContext);

  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

