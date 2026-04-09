import { Alert, Box, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import { InteractiveFarmMap } from "../../map";
import type { CoordinateScreenProps } from "../types";
import { getStepContentStyles } from "../../../styles/theme";

export default function CoordinateVisualizationScreen({
  coordinates,
  setCoordinates,
}: CoordinateScreenProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const stepContentStyles = getStepContentStyles(isDark);

  return (
    <Box sx={stepContentStyles.container}>
      {/* Header */}
      <Box sx={stepContentStyles.section}>
        <Typography
          variant="h5"
          sx={{
            color: "text.primary",
            fontWeight: 600,
          }}
        >
          Visualize your farm boundary
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            lineHeight: 1.6,
          }}
        >
          Your coordinates have been parsed and plotted on the map below. Review
          the boundary and make any adjustments if needed.
        </Typography>
      </Box>

      {/* Map Container */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`,
          borderRadius: 2,
          overflow: "hidden",
          backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "#f9fafb",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: 400,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#e0e0e0",
          }}
        >
          <InteractiveFarmMap
            markers={coordinates}
            setMarkers={setCoordinates}
            isReadOnly={true}
          />
        </Box>
      </Paper>

      {/* Helpful Tip */}
      <Alert icon={<EditIcon />} severity="info">
        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
          Doesn't match your farm boundary? No problem. Exit this modal and use
          the "Draw Boundaries" option instead to manually trace your exact
          field boundary.
        </Typography>
      </Alert>
    </Box>
  );
}
