import { Box, Typography } from "@mui/material";
import { InteractiveFarmMap } from "../../map";
import type { CoordinateScreenProps } from "./types";

export default function CoordinateVisualizationScreen({
  coordinates,
  setCoordinates,
}: CoordinateScreenProps) {
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
