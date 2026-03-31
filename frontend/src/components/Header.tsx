import { Link as RouterLink } from "react-router";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { COLORS } from "../styles/colors";
import { useToast } from "../contexts/ToastContext";

const navButtonSx = {
  color: COLORS.whiteHigh,
  textTransform: "none" as const,
  fontSize: "0.9rem",
  fontWeight: 500,
  "&:hover": {
    backgroundColor: COLORS.whiteHover,
  },
};

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();

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
        backgroundColor: COLORS.bgDark,
        borderBottom: `1px solid ${COLORS.whiteVeryLow}`,
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
