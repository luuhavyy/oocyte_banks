import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { getRoleFromToken } from "../../utils/jwtUtils";

/**
 * ProtectedRoute Component for Admin
 * Checks authentication token and redirects to login page if not authenticated
 */
export default function ProtectedRoute({ children, role }) {
  const { token, user } = useSelector((s) => s.adminAuth);
  const location = useLocation();
  
  // Check token from Redux first, then fallback to localStorage
  const adminToken = token || localStorage.getItem("admin_token");
  
  // If no token, redirect to login page
  if (!adminToken) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  // Get user role from Redux or decode from token
  const userRole = user?.role || getRoleFromToken(adminToken);

  // Check role if specified (e.g., "admin" only routes)
  if (role && userRole !== role) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return children;
}
