import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ManualCoordinateUpload from "./ManualCoordinateUpload";

export default function FileUploadSection() {
  const theme = useTheme();

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          sx={{ color: "text.primary", fontWeight: 600, mb: 0.5 }}
        >
          Field Boundaries
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Draw or upload your field boundary coordinates. At least three points
          are required to define the polygon.
        </Typography>
      </Box>

      <Box
        sx={{
          p: 2.5,
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(0, 0, 0, 0.3)"
              : "rgba(0, 0, 0, 0.02)",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
        }}
      >
        <ManualCoordinateUpload />
      </Box>
    </Box>
  );
}
