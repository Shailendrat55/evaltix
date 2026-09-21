// AuthGuard.jsx
import Cookies from "js-cookie";
import { Navigate, useLocation } from "react-router-dom";

export default function AuthGuard({ children, requiredRole }) {
  const location = useLocation();
  const token = Cookies.get("exam_token") || localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Not logged in at all
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in, but wrong role for this route
  if (requiredRole && role?.toUpperCase() !== requiredRole.toUpperCase()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}