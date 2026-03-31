import { Box, Typography, Container, Button, Paper, Grid } from "@mui/material";
import { Link as RouterLink } from "react-router";
import { COLORS } from "../styles/colors";
import { useAuth } from "../contexts/AuthContext";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import MapIcon from "@mui/icons-material/Map";
import BarChartIcon from "@mui/icons-material/BarChart";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        backgroundColor: COLORS.bgCard,
        border: `1px solid ${COLORS.whiteVeryLow}`,
        borderRadius: 2,
        transition: "border-color 0.2s, box-shadow 0.2s",
        "&:hover": {
          borderColor: COLORS.indigoBorder,
          boxShadow: `0 4px 20px ${COLORS.blackLow}`,
        },
      }}
    >
      <Box sx={{ color: COLORS.indigo, mb: 1.5 }}>{icon}</Box>
      <Typography
        variant="h6"
        sx={{ color: COLORS.whiteHigh, fontWeight: 600, mb: 0.5 }}
      >
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: COLORS.whiteMedium }}>
        {description}
      </Typography>
    </Paper>
  );
}

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)" }}>
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          textAlign: "center",
          background: `linear-gradient(180deg, ${COLORS.bgDark} 0%, ${COLORS.bgPage} 100%)`,
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: COLORS.indigoLight,
              border: `1px solid ${COLORS.indigoBorder}`,
              borderRadius: 5,
              px: 2,
              py: 0.5,
              mb: 3,
            }}
          >
            <AutoAwesomeIcon
              sx={{ fontSize: 16, color: COLORS.indigo }}
            />
            <Typography
              variant="caption"
              sx={{ color: COLORS.indigoText, fontWeight: 500 }}
            >
              AI-Powered Precision Agriculture
            </Typography>
          </Box>

          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: COLORS.whiteHigh,
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              lineHeight: 1.2,
            }}
          >
            Optimize Biochar Application with{" "}
            <Box component="span" sx={{ color: COLORS.indigo }}>
              CharAI
            </Box>
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: COLORS.whiteMedium,
              fontWeight: 400,
              maxWidth: 600,
              mx: "auto",
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            Generate prescription maps for your fields using terrain analysis
            and machine learning. Maximize yield potential while minimizing
            payback periods.
          </Typography>

          {!isAuthenticated && (
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button
                component={RouterLink}
                to="/signup"
                variant="contained"
                size="large"
                data-testid="hero-signup-button"
                sx={{ px: 4, py: 1.5 }}
              >
                Get Started
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                size="large"
                data-testid="hero-login-button"
                sx={{ px: 4, py: 1.5 }}
              >
                Log In
              </Button>
            </Box>
          )}

          {isAuthenticated && (
            <Button
              component={RouterLink}
              to="/fields"
              variant="contained"
              size="large"
              sx={{ px: 4, py: 1.5 }}
            >
              Go to Your Fields
            </Button>
          )}
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography
          variant="h4"
          sx={{
            color: COLORS.whiteHigh,
            fontWeight: 700,
            textAlign: "center",
            mb: 1,
          }}
        >
          How It Works
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: COLORS.whiteMedium,
            textAlign: "center",
            mb: 5,
            maxWidth: 600,
            mx: "auto",
          }}
        >
          Three simple steps to generate a biochar prescription map for your
          farm.
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<AgricultureIcon sx={{ fontSize: 36 }} />}
              title="1. Define Your Field"
              description="Draw your field boundaries on an interactive satellite map or upload GeoJSON coordinates. Set your crop type and current selling price."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<MapIcon sx={{ fontSize: 36 }} />}
              title="2. Analyze Terrain"
              description="Our system downloads high-resolution DEM data for your field and extracts slope, aspect, and elevation features for every grid cell."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<BarChartIcon sx={{ fontSize: 36 }} />}
              title="3. View Prescription Map"
              description="A TensorFlow model predicts yield potential for each cell. View color-coded payback periods and prioritize where biochar has the most impact."
            />
          </Grid>
        </Grid>
      </Container>

      {/* Stats/Social Proof Section */}
      <Box
        sx={{
          py: 6,
          borderTop: `1px solid ${COLORS.whiteVeryLow}`,
          borderBottom: `1px solid ${COLORS.whiteVeryLow}`,
        }}
      >
        <Container maxWidth="md">
          <Grid container spacing={4} justifyContent="center">
            {[
              { value: "30m", label: "DEM Resolution" },
              { value: "12", label: "Supported Crop Types" },
              { value: "<5 min", label: "Processing Time" },
            ].map((stat) => (
              <Grid size={{ xs: 4 }} key={stat.label}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h4"
                    sx={{ color: COLORS.indigo, fontWeight: 700 }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: COLORS.whiteMedium, mt: 0.5 }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      {!isAuthenticated && (
        <Box sx={{ py: { xs: 6, md: 8 }, textAlign: "center" }}>
          <Container maxWidth="sm">
            <Typography
              variant="h5"
              sx={{ color: COLORS.whiteHigh, fontWeight: 600, mb: 1.5 }}
            >
              Ready to optimize your fields?
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: COLORS.whiteMedium, mb: 3 }}
            >
              Create a free account and generate your first prescription map in
              minutes.
            </Typography>
            <Button
              component={RouterLink}
              to="/signup"
              variant="contained"
              size="large"
              sx={{ px: 5, py: 1.5 }}
            >
              Sign Up Free
            </Button>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default LandingPage;
