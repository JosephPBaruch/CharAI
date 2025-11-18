import { Navigate } from 'react-router';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface PublicRouteProps {
  element: React.ReactNode;
}

/**
 * PublicRoute prevents authenticated users from accessing login/signup pages.
 * Redirects them to home page if they try to access these pages.
 */
export function PublicRoute({ element }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{element}</>;
}
