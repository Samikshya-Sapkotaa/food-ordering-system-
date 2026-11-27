// Stops a user from opening a page he is not allowed to open
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

function ProtectedRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();

  // wait till we read localStorage
  if (loading) {
    return <Loader />;
  }

  // not logged in -> send to login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  // admin page but a normal user opened it
  if (adminOnly && !["admin", "superadmin"].includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
