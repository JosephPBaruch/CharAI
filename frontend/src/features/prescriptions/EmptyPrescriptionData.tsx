import { Box, Typography, Button, Container } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router";
import MapIcon from "@mui/icons-material/Map";

export default function EmptyPrescriptionState() {
  const navigate = useNavigate();
  const theme = useTheme();

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
            backgroundColor: alpha(theme.palette.custom.indigo, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MapIcon sx={{ fontSize: 40, color: theme.palette.custom.indigo }} />
        </Box>

        <Box>
          <Typography
            variant="h4"
            sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 1 }}
          >
            No Prescription Data
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: theme.palette.text.secondary, maxWidth: 400 }}
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
            backgroundColor: theme.palette.custom.indigo,
            px: 4,
            py: 1.5,
            "&:hover": { backgroundColor: theme.palette.custom.indigoHover },
          }}
        >
          Configure Farm Data
        </Button>
      </Box>
    </Container>
  );
}
