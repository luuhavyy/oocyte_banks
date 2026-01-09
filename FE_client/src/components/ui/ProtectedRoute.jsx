import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { getSubroleFromToken } from "../../utils/jwtUtils";

/**
 * ProtectedRoute Component for Client
 * Checks authentication token and redirects to landing page if not authenticated
 */
export default function ProtectedRoute({ children, role }) {
  const { token, user } = useSelector((s) => s.auth);
  const location = useLocation();
  
  // Check token from Redux first, then fallback to localStorage
  const clientToken = token || localStorage.getItem("client_token");
  
  // If no token, redirect to landing page
  if (!clientToken) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  // Client: role is always "patient", check subrole for donor/recipient
  const userSubrole = user?.subrole || getSubroleFromToken(clientToken);

  // Check role if specified
  if (role && userSubrole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
