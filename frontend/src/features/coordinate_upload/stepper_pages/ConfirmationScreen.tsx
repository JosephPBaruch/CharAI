import {
  Alert,
  Box,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { LatLngLiteral } from "leaflet";

interface ConfirmationScreenProps {
  fileName: string;
  coordinateCount: number;
  coordinates: LatLngLiteral[];
}

export default function ConfirmationScreen({
  fileName,
  coordinateCount,
  coordinates,
}: ConfirmationScreenProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // Show first and last few coordinates as preview
  const previewCoordinates = coordinates.slice(0, 3);
  const hasMore = coordinateCount > 3;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Success Message */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
          border: `1px solid ${isDark ? alpha(theme.palette.primary.main, 0.3) : alpha(theme.palette.primary.main, 0.2)}`,
          backgroundColor: isDark ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.02),
          borderRadius: 2,
        }}
      >
        <CheckCircleIcon
          sx={{
            color: "primary.main",
            fontSize: 32,
            flexShrink: 0,
            mt: 0.5,
          }}
        />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
          <Typography
            variant="h6"
            sx={{ color: "text.primary", fontWeight: 600 }}
          >
            File Parsed Successfully
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Your coordinate file has been processed and validated. Review the
            summary below before confirming.
          </Typography>
        </Box>
      </Paper>

      {/* File Summary */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography
          variant="subtitle1"
          sx={{ color: "text.primary", fontWeight: 600 }}
        >
          File Summary
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: `1px solid ${isDark ? alpha(theme.palette.common.white, 0.1) : theme.palette.divider}`,
            borderRadius: 1,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            {/* File Name */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                File Name
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.primary",
                  fontWeight: 500,
                  mt: 0.5,
                  wordBreak: "break-word",
                }}
              >
                {fileName}
              </Typography>
            </Box>

            {/* Coordinate Count */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                Coordinates Found
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.primary",
                  fontWeight: 500,
                  mt: 0.5,
                }}
              >
                {coordinateCount} point{coordinateCount !== 1 ? "s" : ""}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Coordinate Preview */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography
          variant="subtitle1"
          sx={{ color: "text.primary", fontWeight: 600 }}
        >
          Coordinate Preview
          {hasMore && (
            <Typography
              component="span"
              variant="caption"
              sx={{ color: "text.secondary", ml: 1 }}
            >
              (Showing {previewCoordinates.length} of {coordinateCount})
            </Typography>
          )}
        </Typography>

        <TableContainer
          sx={{
            borderRadius: 1,
            border: `1px solid ${isDark ? alpha(theme.palette.common.white, 0.1) : theme.palette.divider}`,
            overflow: "hidden",
          }}
        >
          <Table size="small">
            <TableBody>
              {previewCoordinates.map((coord, index) => (
                <TableCell
                  key={index}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: "none",
                    color: "text.primary",
                    fontSize: "0.875rem",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 3 }}>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: "block",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          mb: 0.5,
                        }}
                      >
                        Latitude
                      </Typography>
                      <code
                        style={{
                          fontSize: "0.85rem",
                          fontFamily: "monospace",
                          color: theme.palette.text.primary,
                        }}
                      >
                        {coord.lat.toFixed(6)}
                      </code>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: "block",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          mb: 0.5,
                        }}
                      >
                        Longitude
                      </Typography>
                      <code
                        style={{
                          fontSize: "0.85rem",
                          fontFamily: "monospace",
                          color: theme.palette.text.primary,
                        }}
                      >
                        {coord.lng.toFixed(6)}
                      </code>
                    </Box>
                  </Box>
                </TableCell>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {hasMore && (
          <Alert severity="info" sx={{ mt: 1 }}>
            Showing first {previewCoordinates.length} coordinates. You will
            visualize all {coordinateCount} coordinates on the map in the next
            step.
          </Alert>
        )}
      </Box>

      {/* Info Message */}
      <Alert severity="success" sx={{ mt: 2 }}>
        Ready to proceed! Click &quot;Finish&quot; to visualize your farm
        boundary on the map.
      </Alert>
    </Box>
  );
}
