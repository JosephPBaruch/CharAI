import { Link as RouterLink } from "react-router";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { COLORS } from "../styles/colors";
import { useToast } from "../contexts/ToastContext";

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
      sx={{
        backgroundColor: COLORS.bgPage,
        boxShadow: `0 2px 8px ${COLORS.blackLow}`,
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
          sx={{ fontWeight: "bold", flexShrink: 0 }}
        >
          <RouterLink
            to="/"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            CharAI
          </RouterLink>
        </Typography>
        <Box
          sx={{ display: "flex", gap: 1, flexShrink: 0, alignItems: "center" }}
        >
          {isAuthenticated ? (
            <>
              <Button
                component={RouterLink}
                to="/"
                sx={{
                  color: COLORS.whiteHigh,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                Home
              </Button>
              <Button
                component={RouterLink}
                to="/output"
                sx={{
                  color: COLORS.whiteHigh,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                Maps
              </Button>
              <Button
                component={RouterLink}
                to="/fields"
                sx={{
                  color: COLORS.whiteHigh,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                Fields
              </Button>
              <Button
                onClick={handleLogout}
                data-testid="logout-button"
                sx={{
                  color: COLORS.whiteHigh,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                component={RouterLink}
                to="/"
                sx={{
                  color: COLORS.whiteHigh,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                Home
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                data-testid="login-button"
                sx={{
                  color: COLORS.whiteHigh,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                Log in
              </Button>
              <Button
                component={RouterLink}
                data-testid="signup-button"
                to="/signup"
                sx={{
                  color: COLORS.whiteHigh,
                  textTransform: "none",
                  fontSize: "1rem",
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
