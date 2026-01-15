import { Box, Typography, Container } from "@mui/material";
import { FarmBiocharForm } from "../features/farm";
import { COLORS } from "../styles/colors";
import { useAuth } from "../contexts/AuthContext";

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          textAlign: "center",
          gap: 4,
        }}
      >
        <Box>
          <Typography variant="h3" component="h1" sx={{ color: COLORS.whiteHigh, fontWeight: 700, mb: 1 }}>
            CharAI
          </Typography>
          <Typography variant="body1" sx={{ color: COLORS.whiteMedium }}>
            Optimize your farm's biochar application with AI-powered recommendations
          </Typography>
        </Box>

        {isAuthenticated && <FarmBiocharForm />}
      </Box>
    </Container>
  );
}

export default LandingPage;