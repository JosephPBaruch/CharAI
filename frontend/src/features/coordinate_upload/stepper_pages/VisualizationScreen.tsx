import { Box, Typography } from "@mui/material";
import { InteractiveFarmMap } from "../../map";
import type { CoordinateFileUploadScreenProps } from "./types";

export default function CoordinateVisualizationScreen({
  coordinates,
  setCoordinates,
}: CoordinateFileUploadScreenProps) {
  return (
    <Box sx={{ width: "600px", height: "600px" }}>
      <InteractiveFarmMap
        markers={coordinates}
        setMarkers={setCoordinates}
      ></InteractiveFarmMap>
      <Typography>Hello again.</Typography>
    </Box>
  );
}
