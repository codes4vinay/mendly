import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

// redirects to login if not authenticated
export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// redirects if wrong role
export const RoleRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;

  return <Outlet />;
};
