import { Box, Stack, Typography } from "@mui/material";
import { COLORS } from "../../styles/colors";
import ManualCoordinateUpload from "./ManualCoordinateUpload";
import CoordinateFileUploadModal from "../../components/CoordinateFileUploadModal";

export default function FileUploadSection() {
  return (
    <Box
      sx={{
        p: 2.5,
        border: `1px dashed ${COLORS.indigo}`,
        borderRadius: 2,
        backgroundColor: COLORS.indigoVeryLight,
      }}
    >
      <Typography
        variant="h6"
        sx={{ color: COLORS.indigo, fontWeight: 600, mb: 1.5 }}
      >
        Set Farm Coordinates
      </Typography>

      <Stack direction="column" spacing={2.5}>
        {/* Coordinate File Box */}
        <Box
          sx={{
            p: 2,
            backgroundColor: COLORS.indigoMedium,
            border: `2px solid ${COLORS.indigo}`,
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
