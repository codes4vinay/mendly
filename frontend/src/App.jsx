
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import UserDashboard from "./pages/dashboard/UserDashboard";
import ServiceDashboard from "./pages/dashboard/ServiceDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import Services from "./pages/Services";
import SubmitRequest from "./pages/SubmitRequest";
import TrackRequests from "./pages/TrackRequests";
import ProtectedRoute from "./components/ProtectedRoute";
import jwtDecode from "jwt-decode";

export default function App() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ email: decoded.email, role: decoded.role });
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div
      className={
        theme === "light"
          ? "bg-gray-50 text-gray-800 min-h-screen"
          : "bg-gray-900 text-white min-h-screen"
      }
    >
      <Router>
        <Navbar
          user={user}
          handleLogout={handleLogout}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <div className="pt-16">
          <Routes>
            
            <Route path="/" element={<Home user={user} theme={theme} />} />
            <Route path="/about" element={<About theme={theme} />} />
            <Route path="/contact" element={<Contact theme={theme} />} />

            
            <Route
              path="/login"
              element={<Login setUser={setUser} theme={theme} />}
            />
            <Route
              path="/signup"
              element={<Signup setUser={setUser} theme={theme} />}
            />

            
            <Route path="/services" element={<Services theme={theme} />} />

            
            <Route
              path="/submit-request"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <SubmitRequest theme={theme} />
                </ProtectedRoute>
              }
            />

            
            <Route
              path="/track-requests"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <TrackRequests theme={theme} />
                </ProtectedRoute>
              }
            />

            
            <Route
              path="/dashboard/user"
              element={
                <ProtectedRoute allowedRoles={["user"]}>
                  <UserDashboard theme={theme} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/service"
              element={
                <ProtectedRoute allowedRoles={["serviceCenter"]}>
                  <ServiceDashboard theme={theme} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard theme={theme} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </div>
  );
}
