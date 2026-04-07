import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ManualCoordinateUpload from "./ManualCoordinateUpload";
import CoordinateFileUploadModal from "../../components/CoordinateFileUploadModal";

export default function FileUploadSection() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

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
        sx={{ color: "primary.main", fontWeight: 600, mb: 1.5 }}
      >
        Set Farm Coordinates
      </Typography>

      <Stack direction="column" spacing={2.5}>
        {/* Coordinate File Box */}
        <Box
          sx={{
            p: 2,
            backgroundColor: isDark
              ? "rgba(100, 108, 255, 0.12)"
              : "rgba(100, 108, 255, 0.06)",
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: 1.5,
          }}
        >
          <CoordinateFileUploadModal />
          <ManualCoordinateUpload />
        </Box>
      </Stack>
    </Box>
  );
}
