import {
  Alert,
  Box,
  Paper,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import { InteractiveFarmMap } from "../../map";
import type { CoordinateScreenProps } from "./types";
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
          />
        </Box>
      </Paper>

      {/* Boundary Summary */}
      <Box sx={stepContentStyles.section}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
            backgroundColor: isDark ? "rgba(100, 108, 255, 0.05)" : "rgba(100, 108, 255, 0.02)",
            border: `1px solid ${isDark ? "rgba(100, 108, 255, 0.2)" : "rgba(100, 108, 255, 0.15)"}`,
            borderRadius: 1,
          }}
        >
          {/* Coordinate Count */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block",
                mb: 0.5,
                textTransform: "uppercase",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              Total Points
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "text.primary",
                fontWeight: 600,
              }}
            >
              {coordinates.length}
            </Typography>
          </Box>

          {/* Status */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block",
                mb: 0.5,
                textTransform: "uppercase",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              Status
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "success.main",
                fontWeight: 600,
              }}
            >
              Ready
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Edit Instructions */}
      <Alert
        icon={<EditIcon />}
        severity="info"
      >
        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
          You can click on the map to add or drag markers to adjust the boundary.
          Click existing markers to edit their position.
        </Typography>
      </Alert>

      {/* Helpful Tips */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`,
          borderRadius: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            display: "block",
            mb: 1,
            textTransform: "uppercase",
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          Tips for Accuracy
        </Typography>
        <Box
          component="ul"
          sx={{
            margin: 0,
            paddingLeft: "1.25rem",
            color: "text.secondary",
            fontSize: "0.875rem",
            lineHeight: 1.7,
            "& li": {
              mb: 0.5,
            },
            "& li:last-child": {
              mb: 0,
            },
          }}
        >
          <li>Ensure the boundary accurately represents your entire field</li>
          <li>Close the polygon by having the first and last points nearby</li>
          <li>Verify the map orientation matches your physical field location</li>
        </Box>
      </Paper>
    </Box>
  );
}
