import React from "react";
import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" />;

  try {
    const decoded = jwtDecode(token);

    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      return <Navigate to="/" />;
    }

    return children;
  } catch (err) {
    console.error("Token decode error:", err);
    localStorage.removeItem("token");
    return <Navigate to="/login" />;
  }
}
