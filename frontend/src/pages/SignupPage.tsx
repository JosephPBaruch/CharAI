import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Link as RouterLink } from "react-router";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../contexts/AuthContext";
import type { DjangoErrorResponse, FieldErrors, RegisterRequest } from "../types/auth";
import { normalizeSignupErrors } from "../utils/errors";
import { FormTextField } from "../components/FormTextField";
import { getPageGradientBg } from "../utils/theme";

const SignupPage = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const theme = useTheme();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formData, setFormData] = useState<RegisterRequest>({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear the error for this field
    setErrors((prev) => {
      if (!(name in prev)) return prev; // no error to clear
      const rest = { ...prev };
      delete rest[name];
      return rest;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate("/");
    } catch (err: unknown) {
      setErrors(normalizeSignupErrors(err as DjangoErrorResponse));
    }
  };

  const gradientBg = getPageGradientBg(theme);

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
          maxWidth: 500,
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
          Sign Up
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
            slotProps={{
              htmlInput: {
                "data-testid": "username-input",
              },
            }}
            errorText={errors.username}
          />

          <FormTextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            slotProps={{
              htmlInput: {
                "data-testid": "email-input",
              },
            }}
            errorText={errors.email}
          />

          <FormTextField
            label="First name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            errorText={errors.first_name}
          />

          <FormTextField
            label="Last name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            errorText={errors.last_name}
          />

          <FormTextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            errorText={errors.password}
          />

          <FormTextField
            label="Confirm password"
            name="password2"
            type="password"
            value={formData.password2}
            onChange={handleChange}
            errorText={errors.password2}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{ marginTop: 1 }}
          >
            {isLoading ? <CircularProgress size={24} /> : "Sign up"}
          </Button>
        </Box>
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            Already have an account?{" "}
            <RouterLink
              to="/login"
              style={{ color: theme.palette.primary.main, textDecoration: "none" }}
            >
              Log in here
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SignupPage;
