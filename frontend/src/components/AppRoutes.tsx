import { Routes, Route } from "react-router";
import App from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import HomePage from "../pages/HomePage";
import { ProtectedRoute, PublicRoute } from "../features/auth";
import PrescriptionsPage from "../pages/PrescriptionsPage";
import FieldPage from "../pages/FieldPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root "/" route - shows HomePage for authenticated, LandingPage for unauthenticated */}
      <Route
        path="/"
        element={<ProtectedRoute element={<HomePage />} fallback={<App />} />}
      />

      {/* Auth pages - public, redirects authenticated users to home */}
      <Route path="/login" element={<PublicRoute element={<LoginPage />} />} />
      <Route
        path="/signup"
        element={<PublicRoute element={<SignupPage />} />}
      />

      {/* Prescriptions page - requires authentication */}
      <Route
        path="/output"
        element={<ProtectedRoute element={<PrescriptionsPage />} />}
      />

      <Route
        path="/fields"
        element={<ProtectedRoute element={<FieldPage />} />}
      />

      {/* Catch-all for unmatched routes */}
      <Route
        path="*"
        element={<ProtectedRoute element={<HomePage />} fallback={<App />} />}
      />
    </Routes>
  );
}
