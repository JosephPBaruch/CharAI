import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  element: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ProtectedRoute guards routes to only show authenticated users.
 * @param element - Component to show if user is authenticated
 * @param fallback - Optional component to show if user is NOT authenticated (instead of redirecting to /login)
 */
export function ProtectedRoute({ element, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return null;
  }

  return <>{element}</>;
}
