import { Box, Typography, Container, Paper, Button, Grid } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import TableChartIcon from "@mui/icons-material/TableChart";

const HomePage = () => {
  const { user } = useAuth();
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(180deg, #0a0a0a 0%, ${theme.palette.background.default} 100%)`
            : `linear-gradient(180deg, #f0f0f5 0%, ${theme.palette.background.default} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            py: 4,
          }}
        >
          {/* Header */}
          <Box>
            <Typography
              variant="h3"
              component="h1"
              sx={{ color: "text.primary", fontWeight: 700, mb: 1 }}
            >
              Welcome, {user?.first_name || user?.username}!
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Manage your farm biochar applications and view prescription maps.
            </Typography>
          </Box>

          {/* Quick Actions */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                  <AgricultureIcon sx={{ color: "primary.main" }} />
                  <Typography
                    variant="h6"
                    sx={{ color: "text.primary", fontWeight: 600 }}
                  >
                    Configure a New Field
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mb: 2, flex: 1 }}
                >
                  Set up crop type, selling price, and draw or upload your field
                  boundaries to generate a biochar prescription map.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/fields"
                  variant="contained"
                  sx={{ alignSelf: "flex-start" }}
                >
                  Go to Fields
                </Button>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                  <TableChartIcon sx={{ color: "primary.main" }} />
                  <Typography
                    variant="h6"
                    sx={{ color: "text.primary", fontWeight: 600 }}
                  >
                    View Your Fields
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mb: 2, flex: 1 }}
                >
                  Check processing status, view completed prescription maps,
                  and manage your existing field submissions.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/fields"
                  variant="outlined"
                  sx={{ alignSelf: "flex-start" }}
                >
                  View Fields
                </Button>
              </Paper>
            </Grid>
          </Grid>

          {/* About section */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "text.primary", fontWeight: 600, mb: 1 }}
            >
              About This Tool
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary" }}
            >
              CharAI uses terrain analysis and machine learning to generate
              biochar prescription maps. Define your field, submit coordinates,
              and receive optimized application recommendations.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
