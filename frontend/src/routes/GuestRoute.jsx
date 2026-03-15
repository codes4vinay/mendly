import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

// if already logged in redirect to correct dashboard
const GuestRoute = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Outlet />;
  if (user && user.isEmailVerified === false) {
    return (
      <Navigate
        to="/verify-otp"
        replace
        state={{ email: user.email, purpose: "verify_email" }}
      />
    );
  }

  // redirect based on role
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  if (user?.role === "service")
    return <Navigate to="/service-dashboard" replace />;
  return <Navigate to="/" replace />;
};

export default GuestRoute;
