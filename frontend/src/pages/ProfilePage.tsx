import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Button,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { FormTextField } from "../components/FormTextField";
import * as authService from "../services/authService";
import type { FieldErrors, DjangoErrorResponse } from "../types/auth";

function normalizeErrors(err: unknown): FieldErrors {
  const errors: FieldErrors = {};
  if (err && typeof err === "object") {
    for (const [key, value] of Object.entries(err as DjangoErrorResponse)) {
      if (Array.isArray(value)) {
        errors[key] = value.join(" ");
      } else if (typeof value === "string") {
        errors[key] = value;
      }
    }
  }
  if (Object.keys(errors).length === 0) {
    errors.general = "An unexpected error occurred.";
  }
  return errors;
}

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const theme = useTheme();

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password2: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<FieldErrors>({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Delete account state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteErrors, setDeleteErrors] = useState<FieldErrors>({});
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => {
      if (!(name in prev)) return prev;
      const rest = { ...prev };
      delete rest[name];
      return rest;
    });
    setPasswordSuccess("");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordErrors({});
    setPasswordSuccess("");
    try {
      await authService.changePassword(passwordForm);
      setPasswordSuccess("Password changed successfully.");
      setPasswordForm({
        current_password: "",
        new_password: "",
        new_password2: "",
      });
      showToast({ message: "Password changed successfully.", severity: "success" });
    } catch (err: unknown) {
      setPasswordErrors(normalizeErrors(err));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteErrors({});
    try {
      await authService.deleteAccount({ password: deletePassword });
      setDeleteDialogOpen(false);
      await logout();
      showToast({ message: "Account deleted successfully.", severity: "success" });
      navigate("/");
    } catch (err: unknown) {
      setDeleteErrors(normalizeErrors(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const gradientBg =
    theme.palette.mode === "dark"
      ? `linear-gradient(180deg, #0a0a0a 0%, ${theme.palette.background.default} 100%)`
      : `linear-gradient(180deg, #f0f0f5 0%, ${theme.palette.background.default} 100%)`;

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        background: gradientBg,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, py: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{ color: "text.primary", fontWeight: 700 }}
          >
            Profile
          </Typography>

          {/* User Info Section */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <PersonIcon sx={{ color: "primary.main" }} />
              <Typography
                variant="h6"
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                Account Information
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Username
                </Typography>
                <Typography
                  variant="body1"
                  data-testid="profile-username"
                  sx={{ color: "text.primary", fontWeight: 500 }}
                >
                  {user?.username}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Name
                </Typography>
                <Typography
                  variant="body1"
                  data-testid="profile-name"
                  sx={{ color: "text.primary", fontWeight: 500 }}
                >
                  {[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Not set"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Email
                </Typography>
                <Typography
                  variant="body1"
                  data-testid="profile-email"
                  sx={{ color: "text.primary", fontWeight: 500 }}
                >
                  {user?.email || "Not set"}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Change Password Section */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <LockIcon sx={{ color: "primary.main" }} />
              <Typography
                variant="h6"
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                Change Password
              </Typography>
            </Box>
            <Box
              component="form"
              onSubmit={handlePasswordSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <FormTextField
                label="Current Password"
                name="current_password"
                type="password"
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
                slotProps={{
                  htmlInput: { "data-testid": "current-password-input" },
                }}
                errorText={passwordErrors.current_password}
              />
              <FormTextField
                label="New Password"
                name="new_password"
                type="password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                slotProps={{
                  htmlInput: { "data-testid": "new-password-input" },
                }}
                errorText={passwordErrors.new_password}
              />
              <FormTextField
                label="Confirm New Password"
                name="new_password2"
                type="password"
                value={passwordForm.new_password2}
                onChange={handlePasswordChange}
                slotProps={{
                  htmlInput: { "data-testid": "confirm-new-password-input" },
                }}
                errorText={passwordErrors.new_password2}
              />
              {passwordErrors.general && (
                <Alert severity="error">{passwordErrors.general}</Alert>
              )}
              {passwordSuccess && (
                <Alert severity="success" data-testid="password-success-alert">
                  {passwordSuccess}
                </Alert>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={passwordLoading}
                data-testid="change-password-button"
                sx={{ alignSelf: "flex-start" }}
              >
                {passwordLoading ? <CircularProgress size={24} /> : "Change Password"}
              </Button>
            </Box>
          </Paper>

          {/* Delete Account Section */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <DeleteIcon sx={{ color: "error.main" }} />
              <Typography
                variant="h6"
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                Delete Account
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mb: 2 }}
            >
              Permanently delete your account and all associated data. This action
              cannot be undone.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              data-testid="delete-account-button"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete Account
            </Button>
          </Paper>
        </Box>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletePassword("");
          setDeleteErrors({});
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>
            Confirm Account Deletion
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            This will permanently delete your account, all fields, and prescription
            maps. Enter your password to confirm.
          </Typography>
          <FormTextField
            label="Password"
            name="password"
            type="password"
            value={deletePassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setDeletePassword(e.target.value);
              setDeleteErrors({});
            }}
            slotProps={{
              htmlInput: { "data-testid": "delete-confirm-password-input" },
            }}
            errorText={deleteErrors.password}
          />
          {deleteErrors.general && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {deleteErrors.general}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeletePassword("");
              setDeleteErrors({});
            }}
            data-testid="delete-cancel-button"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={deleteLoading || !deletePassword}
            onClick={handleDeleteAccount}
            data-testid="delete-confirm-button"
          >
            {deleteLoading ? <CircularProgress size={24} /> : "Delete My Account"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
