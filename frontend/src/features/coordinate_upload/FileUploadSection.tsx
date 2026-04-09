import { Box, Stack, Typography, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ManualCoordinateUpload from "./ManualCoordinateUpload";
import CoordinateFileUploadModal from "../../components/CoordinateFileUploadModal";
import { useCoordinates } from "../../contexts/CoordinateContext";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DrawIcon from "@mui/icons-material/Edit";

export default function FileUploadSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { data: coordinateData } = useCoordinates();
  const hasCoordinates = coordinateData !== null;

  return (
    <Box
      sx={{
        p: 2.5,
        border: `1px dashed ${theme.palette.primary.main}`,
        borderRadius: 2,
        backgroundColor: isDark
          ? "rgba(100, 108, 255, 0.08)"
          : "rgba(100, 108, 255, 0.04)",
      }}
    >
      <Typography
        variant="h6"
        sx={{ color: "primary.main", fontWeight: 600, mb: 1 }}
      >
        Set Farm Coordinates
      </Typography>

      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
        Choose your method: upload a file with existing coordinates, or manually
        draw your field boundary on the map.
      </Typography>

      <Stack direction="column" spacing={2}>
        {/* File Upload Option */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: `1px solid ${isDark ? "rgba(100, 108, 255, 0.3)" : "rgba(100, 108, 255, 0.2)"}`,
            borderRadius: 1.5,
            backgroundColor: isDark
              ? "rgba(100, 108, 255, 0.05)"
              : "rgba(100, 108, 255, 0.02)",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: isDark
                ? "rgba(100, 108, 255, 0.6)"
                : "rgba(100, 108, 255, 0.4)",
              backgroundColor: isDark
                ? "rgba(100, 108, 255, 0.08)"
                : "rgba(100, 108, 255, 0.04)",
            },
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <CloudUploadIcon
              sx={{
                color: "primary.main",
                fontSize: "1.5rem",
                mt: 0.25,
                flexShrink: 0,
              }}
            />
            <Stack spacing={1} flex={1}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                }}
              >
                Have a file?
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.5,
                }}
              >
                {hasCoordinates
                  ? "Update your boundary by uploading a new coordinate file (CSV, GeoJSON, or Shapefile)."
                  : "Upload a CSV, GeoJSON, or Shapefile with your field boundary coordinates."}
              </Typography>
            </Stack>
          </Stack>
          <Box sx={{ mt: 1.5 }}>
            <CoordinateFileUploadModal hasCoordinates={hasCoordinates} />
          </Box>
        </Paper>

        {/* Manual Draw Option */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: `1px solid ${isDark ? "rgba(34, 197, 94, 0.3)" : "rgba(34, 197, 94, 0.2)"}`,
            borderRadius: 1.5,
            backgroundColor: isDark
              ? "rgba(34, 197, 94, 0.05)"
              : "rgba(34, 197, 94, 0.02)",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: isDark
                ? "rgba(34, 197, 94, 0.6)"
                : "rgba(34, 197, 94, 0.4)",
              backgroundColor: isDark
                ? "rgba(34, 197, 94, 0.08)"
                : "rgba(34, 197, 94, 0.04)",
            },
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <DrawIcon
              sx={{
                color: "#22c55e",
                fontSize: "1.5rem",
                mt: 0.25,
                flexShrink: 0,
              }}
            />
            <Stack spacing={1} flex={1}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                }}
              >
                Prefer to draw?
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.5,
                }}
              >
                {hasCoordinates
                  ? "Adjust your boundary by manually drawing on the map, or start over with a new boundary."
                  : "Click on the map to place markers and trace your field boundary manually."}
              </Typography>
            </Stack>
          </Stack>
          <Box sx={{ mt: 1.5 }}>
            <ManualCoordinateUpload />
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
}
