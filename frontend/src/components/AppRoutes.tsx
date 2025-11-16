import { Routes, Route } from 'react-router';
import App from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import HomePage from '../pages/HomePage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

/**
 * AppRoutes component orchestrates all routing logic:
 *
 * ProtectedRoute: Only allows authenticated users
 *   - If loading: shows spinner
 *   - If NOT authenticated: shows fallback or renders nothing
 *   - If authenticated: renders the protected element
 *
 * PublicRoute: Only allows unauthenticated users
 *   - If loading: shows spinner
 *   - If authenticated: redirects to /
 *   - If NOT authenticated: renders the public element
 *
 * Route structure:
 *   "/" → Dynamic based on auth status
 *      - Authenticated: HomePage (protected)
 *      - Unauthenticated: App.tsx (landing page, public)
 *   "/login" → PublicRoute → LoginPage (unauthenticated users only)
 *   "/signup" → PublicRoute → SignupPage (unauthenticated users only)
 *   "*" (catch-all) → Dynamic based on auth status
 *      - Authenticated: HomePage (protected)
 *      - Unauthenticated: App.tsx (landing page, public)
 */
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
