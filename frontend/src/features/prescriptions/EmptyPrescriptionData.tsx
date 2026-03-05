import { Box, Typography, Button, Container } from "@mui/material";
import { COLORS } from "../../styles/colors";
import { useNavigate } from "react-router";
import MapIcon from "@mui/icons-material/Map";

export default function EmptyPrescriptionState() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "70vh",
          textAlign: "center",
          gap: 3,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            backgroundColor: COLORS.indigoLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MapIcon sx={{ fontSize: 40, color: COLORS.indigo }} />
        </Box>

        <Box>
          <Typography
            variant="h4"
            sx={{ color: COLORS.whiteHigh, fontWeight: 700, mb: 1 }}
          >
            No Prescription Data
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: COLORS.whiteMedium, maxWidth: 400 }}
          >
            To view prescription maps and biochar application recommendations,
            please submit your farm configuration with boundary coordinates.
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/")}
          sx={{
            backgroundColor: COLORS.indigo,
            px: 4,
            py: 1.5,
            "&:hover": { backgroundColor: COLORS.indigoHover },
          }}
        >
          Configure Farm Data
        </Button>
      </Box>
    </Container>
  );
}
