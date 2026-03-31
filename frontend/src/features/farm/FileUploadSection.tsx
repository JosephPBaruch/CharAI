import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ManualCoordinateUpload from "./ManualCoordinateUpload";

export default function FileUploadSection() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 2.5,
        border: `1px dashed ${theme.palette.primary.main}`,
        borderRadius: 2,
        backgroundColor: theme.palette.mode === "dark"
          ? "rgba(100, 108, 255, 0.05)"
          : "rgba(100, 108, 255, 0.03)",
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
            backgroundColor: theme.palette.mode === "dark"
              ? "rgba(100, 108, 255, 0.15)"
              : "rgba(100, 108, 255, 0.08)",
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: 1.5,
          }}
        >
          <ManualCoordinateUpload />
        </Box>
      </Stack>
    </Box>
  );
}
