import { Routes, Route } from 'react-router';
import App from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import HomePage from '../pages/HomePage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root "/" route - shows HomePage for authenticated, App.tsx for unauthenticated */}
      <Route path="/" element={<ProtectedRoute element={<HomePage />} fallback={<App />} />} />
      
      {/* Auth pages - public, redirects authenticated users to home */}
      <Route path="/login" element={<PublicRoute element={<LoginPage />} />} />
      <Route path="/signup" element={<PublicRoute element={<SignupPage />} />} />
      
      {/* Catch-all for unmatched routes */}
      <Route path="*" element={<ProtectedRoute element={<HomePage />} fallback={<App />} />} />
    </Routes>
  );
}
