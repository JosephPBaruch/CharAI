import React from "react";
import { Box, Typography, Container, Button, Paper, Grid, Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import { Link as RouterLink } from "react-router";
import { useTheme } from "@mui/material/styles";
import { useAuth } from "../contexts/AuthContext";
import { useCoordinates } from "../contexts/CoordinateContext";
import { useNavigate } from "react-router";
import { POSTFieldData } from "../api/fetch";
import { v4 as uuidv4 } from "uuid";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import MapIcon from "@mui/icons-material/Map";
import BarChartIcon from "@mui/icons-material/BarChart";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import BiocharSettings from "../features/farm/BudgetSettings";
import FieldsList from "../features/farm/FieldsList";
import type { FieldEntry } from "../features/farm/FieldsList";
import FileUploadSection from "../features/farm/FileUploadSection";
import SubmitSection from "../features/farm/SubmitSection";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        transition: "border-color 0.2s, box-shadow 0.2s",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: `0 4px 20px rgba(0,0,0,0.15)`,
        },
      }}
    >
      <Box sx={{ color: "primary.main", mb: 1.5 }}>{icon}</Box>
      <Typography
        variant="h6"
        sx={{ color: "text.primary", fontWeight: 600, mb: 0.5 }}
      >
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        {description}
      </Typography>
    </Paper>
  );
}

const DEFAULT_FIELD = (): FieldEntry => ({
  id: `main-field-${uuidv4()}`,
  cropType: "WW",
  price: "",
  unit: "bushel",
  biocharTonsPerHectare: 20,
  biocharCostPerTon: "",
});

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const { data, hasCoordinates, setFormSubmitted } = useCoordinates();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [field, setField] = React.useState<FieldEntry>(DEFAULT_FIELD());
  const [coordUploaded, setCoordUploaded] = React.useState(false);

  React.useEffect(() => {
    if (hasCoordinates) {
      setCoordUploaded(true);
    }
  }, [hasCoordinates]);

  const updateField = (patch: Partial<FieldEntry>) => {
    setField((prev) => ({ ...prev, ...patch }));
  };

  const coordsReady = coordUploaded || hasCoordinates;
  const isPriceValid = field.price !== "" && field.price > 0;
  const isBiocharCostValid =
    field.biocharCostPerTon !== "" && field.biocharCostPerTon > 0;
  const canSubmit = coordsReady && isPriceValid && isBiocharCostValid;

  const gradientBg =
    theme.palette.mode === "dark"
      ? `linear-gradient(180deg, #0a0a0a 0%, ${theme.palette.background.default} 100%)`
      : `linear-gradient(180deg, #f0f0f5 0%, ${theme.palette.background.default} 100%)`;

  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", background: gradientBg }}>
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: theme.palette.mode === "dark" ? "rgba(100, 108, 255, 0.1)" : "rgba(100, 108, 255, 0.08)",
              border: `1px solid rgba(99, 102, 241, 0.3)`,
              borderRadius: 5,
              px: 2,
              py: 0.5,
              mb: 3,
            }}
          >
            <AutoAwesomeIcon
              sx={{ fontSize: 16, color: "primary.main" }}
            />
            <Typography
              variant="caption"
              sx={{ color: "primary.light", fontWeight: 500 }}
            >
              AI-Powered Precision Agriculture
            </Typography>
          </Box>

          <Typography
            variant="h2"
            component="h1"
            sx={{
              color: "text.primary",
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              lineHeight: 1.2,
            }}
          >
            Optimize Biochar Application with{" "}
            <Box component="span" sx={{ color: "primary.main" }}>
              CharAI
            </Box>
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              fontWeight: 400,
              maxWidth: 600,
              mx: "auto",
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            Generate prescription maps using terrain analysis and machine
            learning to maximize yield potential.
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
              variant="contained"
              size="large"
              onClick={() => setIsModalOpen(true)}
              sx={{ px: 4, py: 1.5 }}
            >
              New Field
            </Button>
          )}
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography
          variant="h4"
          sx={{
            color: "text.primary",
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
            color: "text.secondary",
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
              description="Draw field boundaries on an interactive map or upload GeoJSON coordinates. Set crop type and selling price."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<MapIcon sx={{ fontSize: 36 }} />}
              title="2. Analyze Terrain"
              description="The system downloads DEM data and extracts slope, aspect, and elevation features for every grid cell."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<BarChartIcon sx={{ fontSize: 36 }} />}
              title="3. View Prescription Map"
              description="A ML model predicts yield potential for each cell. View color-coded payback periods and prioritize impact."
            />
          </Grid>
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box
        sx={{
          py: 6,
          borderTop: `1px solid ${theme.palette.divider}`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="md">
          <Grid container spacing={4} justifyContent="center">
            {[
              { value: "12", label: "Supported Crop Types" },
              { value: "<5 min", label: "Processing Time" },
            ].map((stat) => (
              <Grid size={{ xs: 6 }} key={stat.label}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h4"
                    sx={{ color: "primary.main", fontWeight: 700 }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mt: 0.5 }}
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
              sx={{ color: "text.primary", fontWeight: 600, mb: 1.5 }}
            >
              Ready to optimize your fields?
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", mb: 3 }}
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

      {/* New Field Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Create New Field
          </Typography>
          <IconButton onClick={() => setIsModalOpen(false)} sx={{ color: "text.secondary" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Configure your field's crop and selling price, set your biochar
              budget, and upload boundary coordinates.
            </Typography>
            <BiocharSettings
              biocharTonsPerHectare={field.biocharTonsPerHectare}
              biocharCostPerTon={field.biocharCostPerTon}
              onChangeTonsPerHectare={(v) =>
                updateField({ biocharTonsPerHectare: v })
              }
              onChangeCostPerTon={(v) => updateField({ biocharCostPerTon: v })}
            />
            <FieldsList field={field} onUpdateField={updateField} />
            <FileUploadSection />
            <SubmitSection
              coordsReady={canSubmit}
              onSubmit={async () => {
                if (!isPriceValid) {
                  alert("Please enter a valid crop selling price.");
                  return;
                }
                if (!isBiocharCostValid) {
                  alert("Please enter a valid biochar cost per ton.");
                  return;
                }
                const payload = {
                  field: {
                    ...field,
                    biocharCostPerTon: field.biocharCostPerTon as number,
                  },
                  data,
                };
                try {
                  await POSTFieldData(payload);
                  setFormSubmitted(true);
                  setIsModalOpen(false);
                  navigate("/fields");
                } catch (err) {
                  console.debug("Field submission failed:", err);
                  alert("Failed to submit field. Please try again.");
                }
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LandingPage;
