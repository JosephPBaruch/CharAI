import { Box, Button, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import FarmBiocharForm from '../components/FarmBiocharForm';
import { COLORS } from '../styles/colors';

const HomePage = () => {
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
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          py: 4,
        }}
      >
        {/* Header: title + logout */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h3" component="h1" sx={{ color: COLORS.whiteHigh, fontWeight: 700, mb: 1 }}>
              Welcome, {user?.first_name || user?.username}!
            </Typography>
            <Typography variant="body1" sx={{ color: COLORS.whiteMedium }}>
              Manage your farm biochar applications and data below.
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={handleLogout}
            sx={{ height: 'fit-content', backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#c62828' } }}
          >
            Log Out
          </Button>
        </Box>

        {/* Intro boilerplate */}
        <Box sx={{ backgroundColor: COLORS.blackMedium, p: 3, borderRadius: 1.5, border: `1px solid ${COLORS.whiteLow}` }}>
          <Typography variant="h6" sx={{ color: COLORS.whiteHigh, fontWeight: 600, mb: 1 }}>
            About this tool
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.whiteMedium, mb: 1.5 }}>
            This application helps you plan and manage biochar applications across your farm. Use the form below to define each field, specify crops and current selling prices, and upload geographic coordinate files that define your field boundaries.
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.whiteMedium }}>
            After uploading your coordinate file (required) and any optional yield data, you can submit a request to estimate potential impacts and budget allocation for biochar application.
          </Typography>
        </Box>

        {/* Farm configuration form placed below the intro */}
        <Box>
          <FarmBiocharForm />
        </Box>
      </Box>
    </Container>
  );
}

export default HomePage;