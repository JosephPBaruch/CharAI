import { Box, Typography, Container, Paper, Button, Grid } from "@mui/material";
import { Link as RouterLink } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { COLORS } from "../styles/colors";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import TableChartIcon from "@mui/icons-material/TableChart";

const HomePage = () => {
  const { user } = useAuth();

  return (
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
            sx={{ color: COLORS.whiteHigh, fontWeight: 700, mb: 1 }}
          >
            Welcome, {user?.first_name || user?.username}!
          </Typography>
          <Typography variant="body1" sx={{ color: COLORS.whiteMedium }}>
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
                backgroundColor: COLORS.bgCard,
                border: `1px solid ${COLORS.whiteVeryLow}`,
                borderRadius: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <AgricultureIcon sx={{ color: COLORS.indigo }} />
                <Typography
                  variant="h6"
                  sx={{ color: COLORS.whiteHigh, fontWeight: 600 }}
                >
                  Configure a New Field
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ color: COLORS.whiteMedium, mb: 2, flex: 1 }}
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
                backgroundColor: COLORS.bgCard,
                border: `1px solid ${COLORS.whiteVeryLow}`,
                borderRadius: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <TableChartIcon sx={{ color: COLORS.indigo }} />
                <Typography
                  variant="h6"
                  sx={{ color: COLORS.whiteHigh, fontWeight: 600 }}
                >
                  View Your Fields
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ color: COLORS.whiteMedium, mb: 2, flex: 1 }}
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
            backgroundColor: COLORS.bgCard,
            border: `1px solid ${COLORS.whiteVeryLow}`,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: COLORS.whiteHigh, fontWeight: 600, mb: 1 }}
          >
            About This Tool
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: COLORS.whiteMedium, mb: 1.5 }}
          >
            CharAI helps you plan and manage biochar applications across your
            farm. Define each field with crop type and selling price, upload
            geographic coordinates that define your field boundaries, and submit
            a request to estimate potential impacts and budget allocation for
            biochar application.
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.whiteMedium }}>
            The system downloads terrain data, analyzes slope, aspect, and
            elevation for each grid cell, then uses a machine learning model
            to predict yield potential and calculate payback periods for biochar
            investment.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default HomePage;
