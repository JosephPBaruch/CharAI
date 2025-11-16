import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          gap: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h3" component="h1">
          Welcome, {user?.first_name || user?.username}!
        </Typography>

        <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          You are successfully logged in to CharAI.
        </Typography>

        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
          sx={{ mt: 2 }}
        >
          Log Out
        </Button>
      </Box>
    </Container>
  );
}
