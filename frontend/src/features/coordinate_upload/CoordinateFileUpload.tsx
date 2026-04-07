import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { parseFileToGeoJSON } from "../../services/coordinateService";
import { useCoordinates } from "../../contexts/CoordinateContext";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function CoordinateFileUpload(props: {
  onSelect?: (file: File | null) => void;
  onUploadComplete?: () => void;
}) {
  const { onSelect, onUploadComplete } = props || {};
  const { setCoordinateData } = useCoordinates();
  const theme = useTheme();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files === null) {
      throw Error("Error: No files selected");
    }
    const f = event.target.files[0];
    setSelectedFile(f);
    onSelect?.(f);
  };

  const handleFileSubmit = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      // Parse file locally and save to context (temporary localStorage-based storage)
      const geojson = await parseFileToGeoJSON(selectedFile);
      setCoordinateData(geojson);
      console.log("Success! Coordinates saved locally");
      setSelectedFile(null);
      onSelect?.(null);
      onUploadComplete?.();
    } catch (err: any) {
      console.error("Failed to process coordinates:", err);
      // TODO: Show error message in UI
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    onSelect?.(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "flex-start",
      }}
    >
      {!selectedFile ? (
        <Button
          variant="contained"
          component="label"
        >
          Choose file
          <VisuallyHiddenInput
            type="file"
            accept=".shp,.shx,.dbf,.geojson,.csv,.kml,.kmz,.json"
            onChange={handleFileChange}
          />
        </Button>
      ) : (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            padding: 1.5,
            backgroundColor: theme.palette.mode === "dark"
              ? "rgba(100, 108, 255, 0.15)"
              : "rgba(100, 108, 255, 0.08)",
            border: `1px solid ${theme.palette.primary.main}`,
            borderRadius: 1,
            minWidth: 300,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              flex: 1,
              color: "text.primary",
              wordBreak: "break-word",
            }}
          >
            {selectedFile.name}
          </Typography>
          <IconButton
            size="small"
            onClick={handleClearFile}
            disabled={isLoading}
            sx={{ color: "text.primary" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      )}

      {selectedFile && (
        <Button
          variant="contained"
          onClick={handleFileSubmit}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
          {isLoading ? "Uploading..." : "Submit file"}
        </Button>
      )}
    </Box>
  );
}
