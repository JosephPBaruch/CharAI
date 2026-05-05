import { Link as RouterLink, useNavigate } from "react-router";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useThemeMode } from "../contexts/ThemeContext";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { showToast } = useToast();
  const { mode, toggleTheme } = useThemeMode();
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
    setAnchorEl(null);
    try {
      await logout();
      navigate("/");
    } catch {
      showToast({
        message: "Logout failed. Please try again.",
        severity: "error",
      });
    }
  };

  const getInitials = () => {
    if (user?.first_name || user?.last_name) {
      return `${(user.first_name?.[0] ?? "").toUpperCase()}${(user.last_name?.[0] ?? "").toUpperCase()}`;
    }
    return user?.username?.[0]?.toUpperCase() ?? "U";
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
          sx={{
            fontWeight: 700,
            flexShrink: 0,
            letterSpacing: "-0.02em",
            color: "text.primary",
          }}
        >
          <RouterLink
            to="/"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            BiocharEducation
          </RouterLink>
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            flexShrink: 0,
            alignItems: "center",
          }}
        >
          <Tooltip
            title={
              mode === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
          >
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
              <Button component={RouterLink} to="/" sx={navButtonSx}>
                Home
              </Button>
              <Button component={RouterLink} to="/fields" sx={navButtonSx}>
                Fields
              </Button>
              <Tooltip title="Account">
                <IconButton
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  data-testid="profile-menu-button"
                  sx={{ ml: 0.5 }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      fontSize: "0.875rem",
                      bgcolor: "primary.main",
                    }}
                  >
                    {getInitials()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                slotProps={{
                  paper: {
                    sx: {
                      minWidth: 180,
                      mt: 1,
                    },
                  },
                }}
              >
                <MenuItem
                  component={RouterLink}
                  to="/profile"
                  onClick={() => setAnchorEl(null)}
                  data-testid="profile-link"
                >
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Profile</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} data-testid="logout-button">
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button component={RouterLink} to="/" sx={navButtonSx}>
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
