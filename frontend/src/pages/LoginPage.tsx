import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import type { LoginRequest } from '../types/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState<LoginRequest>({ username: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate('/');
    } catch (err: any) {
      // Intentionally no UI error handling per user request. Log for debugging only.
      // Errors are not displayed in the UI.
      // eslint-disable-next-line no-console
      console.warn('Login error (not shown in UI):', err);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
        padding: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          backgroundColor: '#1a1a1a',
          padding: 3,
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}
      >
        <Typography variant="h5" component="h2" sx={{ marginBottom: 2, textAlign: 'center' }}>
          Log in
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'rgba(255, 255, 255, 0.87)',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.5)',
                opacity: 1,
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
            }}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'rgba(255, 255, 255, 0.87)',
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.23)' },
                '&:hover fieldset': { borderColor: 'rgba(255, 255, 255, 0.4)' },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.5)',
                opacity: 1,
              },
              '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
            }}
          />

          {/* No UI error alerts per user request */}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{ marginTop: 1 }}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Log in'}
          </Button>
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Don't have an account?{' '}
            <RouterLink to="/signup" style={{ color: '#646cff', textDecoration: 'none' }}>
              Sign up here
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
