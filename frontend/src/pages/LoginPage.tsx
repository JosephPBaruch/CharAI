import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Link as RouterLink } from "react-router";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../contexts/AuthContext";
import type { LoginRequest } from "../types/auth";
import { FormTextField } from "../components/FormTextField";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const theme = useTheme();
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState<LoginRequest>({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate("/");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "error" in err
          ? String((err as Record<string, unknown>).error)
          : "Login failed. Please try again.";
      setErrorMessage(message);
    }
  };

  const gradientBg =
    theme.palette.mode === "dark"
      ? `linear-gradient(180deg, #0a0a0a 0%, ${theme.palette.background.default} 100%)`
      : `linear-gradient(180deg, #f0f0f5 0%, ${theme.palette.background.default} 100%)`;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 64px)",
        padding: 2,
        background: gradientBg,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          backgroundColor: "background.paper",
          padding: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.palette.mode === "dark"
            ? "0 4px 12px rgba(0,0,0,0.5)"
            : "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{ marginBottom: 2, textAlign: "center", color: "text.primary" }}
        >
          Log in
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <FormTextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />

          <FormTextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />

          {!!errorMessage && (
            <Alert severity="error">
              {errorMessage}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{ marginTop: 1 }}
          >
            {isLoading ? <CircularProgress size={24} /> : "Log in"}
          </Button>
        </Box>
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            Don't have an account?{" "}
            <RouterLink
              to="/signup"
              style={{ color: theme.palette.primary.main, textDecoration: "none" }}
            >
              Sign up here
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
