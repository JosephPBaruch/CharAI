import { Box, Button, Typography } from "@mui/material";
import type { FileTypes, FileTypeSeparationScreenProps } from "./types";

export default function FileTypeSeparationScreen({
  setFileType,
  handleNext,
}: FileTypeSeparationScreenProps) {
  const handleClick = (fileType: FileTypes) => {
    setFileType(fileType);
    handleNext();
  };
  return (
    <Box>
      {/* TODO: add back AKA CLOSE (because it's the first step) to this stepper page.*/}
      <Typography variant="h3">Hello!</Typography>
      <Typography variant="h5">
        In a few easy steps, we will get your farm-boundary file converted and
        uploaded into our system.
      </Typography>
      <Typography>
        First, we need to know which file type you are using.
      </Typography>
      <Typography>
        CharAI currently accepts: .csv, .json, .shp, .geojson, .kml
      </Typography>
      <Typography>
        If you're using .csv or .json, we need the farm boundary in a specific
        format.
      </Typography>
      <Button variant="contained" onClick={() => handleClick("text")}>
        I'm using .csv or .json
      </Button>
      <Button variant="contained" onClick={() => handleClick("visual")}>
        I'm using .geojson, .kml, or .shp
      </Button>
    </Box>
  );
}
