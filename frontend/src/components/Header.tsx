import { Link as RouterLink } from "react-router";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useThemeMode } from "../contexts/ThemeContext";

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();

  const navButtonSx = {
    color: theme.palette.text.primary,
    textTransform: "none" as const,
    fontSize: "0.9rem",
    fontWeight: 500,
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      showToast({
        message: "Logout failed. Please try again.",
        severity: "error",
      });
    }
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          paddingX: 3,
          minHeight: 64,
          width: "100%",
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 700, flexShrink: 0, letterSpacing: "-0.02em" }}
        >
          <RouterLink
            to="/"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            CharAI
          </RouterLink>
        </Typography>
        <Box
          sx={{ display: "flex", gap: 0.5, flexShrink: 0, alignItems: "center" }}
        >
          <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            <IconButton
              onClick={toggleTheme}
              sx={{ color: theme.palette.text.secondary }}
              data-testid="theme-toggle"
            >
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          {isAuthenticated ? (
            <>
              <Button
                component={RouterLink}
                to="/"
                sx={navButtonSx}
              >
                Home
              </Button>
              <Button
                component={RouterLink}
                to="/fields"
                sx={navButtonSx}
              >
                Fields
              </Button>
              <Button
                onClick={handleLogout}
                data-testid="logout-button"
                sx={navButtonSx}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                component={RouterLink}
                to="/"
                sx={navButtonSx}
              >
                Home
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                data-testid="login-button"
                sx={navButtonSx}
              >
                Log in
              </Button>
              <Button
                component={RouterLink}
                data-testid="signup-button"
                to="/signup"
                variant="contained"
                sx={{
                  fontSize: "0.9rem",
                  fontWeight: 500,
                }}
              >
                Sign up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
