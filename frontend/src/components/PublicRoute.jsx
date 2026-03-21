import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="screen-message">Checking your session...</div>;
  }

  if (isAuthenticated) {
    const target =
      user?.role === "manager" || user?.role === "admin" ? "/manager/dashboard" : "/dashboard";
    return <Navigate to={target} replace />;
  }

  return children;
}
