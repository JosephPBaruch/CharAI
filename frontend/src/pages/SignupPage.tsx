import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router';
import { Box, TextField, Button, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import type { RegisterRequest } from '../types/auth';
import { COLORS } from '../styles/colors';

const SignupPage = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
  });
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/');
    } catch (err: any) {
      // No UI error handling per user request. Log for debugging only.
      // eslint-disable-next-line no-console
      console.warn('Registration error (not shown in UI):', err);
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
          maxWidth: 500,
          backgroundColor: '#1a1a1a',
          padding: 3,
          borderRadius: 2,
          boxShadow: `0 4px 12px ${COLORS.blackMedium}`,
        }}
      >
        <Typography variant="h5" component="h2" sx={{ marginBottom: 2, textAlign: 'center' }}>
          Sign Up
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
                color: COLORS.whiteHigh,
                '& fieldset': { borderColor: 'COLORS.whiteLow' },
                '&:hover fieldset': { borderColor: 'COLORS.whiteMedium' },
              },
              '& .MuiInputBase-input::placeholder': {
                color: COLORS.whiteMedium,
                opacity: 1,
              },
              '& .MuiInputLabel-root': { color: 'COLORS.whiteHigh' },
            }}
          />

          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            disabled={isLoading}
            
            sx={{
              '& .MuiOutlinedInput-root': {
                color: COLORS.whiteHigh,
                '& fieldset': { borderColor: 'COLORS.whiteLow' },
                '&:hover fieldset': { borderColor: 'COLORS.whiteMedium' },
              },
              '& .MuiInputBase-input::placeholder': {
                color: COLORS.whiteMedium,
                opacity: 1,
              },
              '& .MuiInputLabel-root': { color: 'COLORS.whiteHigh' },
            }}
          />

          <TextField
            label="First name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: COLORS.whiteHigh,
                '& fieldset': { borderColor: 'COLORS.whiteLow' },
                '&:hover fieldset': { borderColor: 'COLORS.whiteMedium' },
              },
              '& .MuiInputBase-input::placeholder': {
                color: COLORS.whiteMedium,
                opacity: 1,
              },
              '& .MuiInputLabel-root': { color: 'COLORS.whiteHigh' },
            }}
          />

          <TextField
            label="Last name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: COLORS.whiteHigh,
                '& fieldset': { borderColor: 'COLORS.whiteLow' },
                '&:hover fieldset': { borderColor: 'COLORS.whiteMedium' },
              },
              '& .MuiInputBase-input::placeholder': {
                color: COLORS.whiteMedium,
                opacity: 1,
              },
              '& .MuiInputLabel-root': { color: 'COLORS.whiteHigh' },
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
                color: COLORS.whiteHigh,
                '& fieldset': { borderColor: 'COLORS.whiteLow' },
                '&:hover fieldset': { borderColor: 'COLORS.whiteMedium' },
              },
              '& .MuiInputBase-input::placeholder': {
                color: COLORS.whiteMedium,
                opacity: 1,
              },
              '& .MuiInputLabel-root': { color: 'COLORS.whiteHigh' },
            }}
          />

          <TextField
            label="Confirm password"
            name="password2"
            type="password"
            value={formData.password2}
            onChange={handleChange}
            variant="outlined"
            fullWidth
            disabled={isLoading}
            
            sx={{
              '& .MuiOutlinedInput-root': {
                color: COLORS.whiteHigh,
                '& fieldset': { borderColor: 'COLORS.whiteLow' },
                '&:hover fieldset': { borderColor: 'COLORS.whiteMedium' },
              },
              '& .MuiInputBase-input::placeholder': {
                color: COLORS.whiteMedium,
                opacity: 1,
              },
              '& .MuiInputLabel-root': { color: 'COLORS.whiteHigh' },
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
            {isLoading ? <CircularProgress size={24} /> : 'Sign up'}
          </Button>
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: COLORS.whiteHigh }}>
            Already have an account?{' '}
            <RouterLink to="/login" style={{ color: COLORS.indigo, textDecoration: 'none' }}>
              Log in here
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SignupPage;
