import { Navigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

interface PublicRouteProps {
  element: React.ReactNode;
}

/**
 * PublicRoute prevents authenticated users from accessing login/signup pages.
 * Redirects them to home page if they try to access these pages.
 */
export function PublicRoute({ element }: PublicRouteProps) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{element}</>;
}
