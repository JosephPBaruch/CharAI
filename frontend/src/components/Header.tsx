import { Link as RouterLink } from 'react-router';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#242424', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
      <Toolbar sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        paddingX: 3,
        minHeight: 64,
        width: '100%',
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', flexShrink: 0 }}>
          <RouterLink 
            to="/"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            CharAI
          </RouterLink>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, alignItems: 'center' }}>
          {isAuthenticated ? (
            <>
              <Button
                onClick={handleLogout}
                sx={{ color: 'rgba(255, 255, 255, 0.87)', textTransform: 'none', fontSize: '1rem' }}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button
                component={RouterLink}
                to="/"
                sx={{ color: 'rgba(255, 255, 255, 0.87)', textTransform: 'none', fontSize: '1rem' }}
              >
                Home
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                sx={{ color: 'rgba(255, 255, 255, 0.87)', textTransform: 'none', fontSize: '1rem' }}
              >
                Log in
              </Button>
              <Button
                component={RouterLink}
                to="/signup"
                sx={{ color: 'rgba(255, 255, 255, 0.87)', textTransform: 'none', fontSize: '1rem' }}
              >
                Sign up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
