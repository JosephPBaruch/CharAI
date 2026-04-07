import {
  Alert,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Dropzone from "react-dropzone";
import type { FileUploadScreenProps } from "./types";
import { getDropzoneStyles } from "../../../styles/theme";
import React from "react";

const jsonExample = [
  { lat: 46.7312, lng: -117.0015 },
  { lat: 46.732, lng: -117.0028 },
  { lat: 46.7328, lng: -117.001 },
  { lat: 46.7315, lng: -117.0002 },
];

const csvExample = `lat,lng,name
46.7312,-117.0015,Field A
46.7320,-117.0028,Field A
46.7328,-117.0010,Field A
46.7315,-117.0002,Field A`;

export default function TextFileUploadScreen({
  MAX_NUMBER_OF_BYTES,
  acceptedFileTypeObject,
  handleRejectedFile,
  handleAcceptedFile,
  handleError,
  errorMessage,
  file,
}: FileUploadScreenProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const dropzoneStylesThemed = getDropzoneStyles(isDark);
  const [fileExtension, setFileExtension] = React.useState<"csv" | "json">(
    "csv",
  );

  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFileExtension: "csv" | "json" | null,
  ) => {
    if (newFileExtension !== null) setFileExtension(newFileExtension);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ color: "text.primary", mb: 1 }}>
        Upload a coordinate file
      </Typography>
      <Typography sx={{ color: "text.secondary" }}>
        Before you upload a file, it must be correctly formatted. Review the
        formats below to see what we are expecting, and please adjust your file
        accordingly.
      </Typography>
      <Typography sx={{ color: "text.secondary" }}>
        Note: it is okay if additional columns or information are included in
        your file. We just need the coordinates to included in your file
        accordinging to the file formats.
      </Typography>
      <ToggleButtonGroup
        onChange={handleChange}
        exclusive
        value={fileExtension}
      >
        <ToggleButton
          value="csv"
          sx={{ textTransform: "none", mb: 1, color: "text.primary" }}
        >
          .csv
        </ToggleButton>
        <ToggleButton
          value="json"
          sx={{ textTransform: "none", mb: 1, color: "text.primary" }}
        >
          .json
        </ToggleButton>
      </ToggleButtonGroup>
      {fileExtension === "csv" ? (
        <pre style={{ color: theme.palette.text.primary, overflow: "auto" }}>
          {csvExample}
        </pre>
      ) : (
        <pre style={{ color: theme.palette.text.primary, overflow: "auto" }}>
          {JSON.stringify(jsonExample, null, 2)}
        </pre>
      )}
      <Dropzone
        accept={acceptedFileTypeObject}
        maxFiles={1}
        maxSize={MAX_NUMBER_OF_BYTES}
        onDropRejected={handleRejectedFile}
        onDropAccepted={handleAcceptedFile}
        onError={handleError}
      >
        {({ getRootProps, getInputProps, isDragActive, isDragReject }) => {
          const dropzoneSx = {
            ...dropzoneStylesThemed.base,
            ...(isDragActive ? dropzoneStylesThemed.active : {}),
            ...(isDragReject ? dropzoneStylesThemed.reject : {}),
          };

          return (
            <section>
              <Box {...getRootProps({ style: dropzoneSx })}>
                <input {...getInputProps()} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Drag and drop a file here, or click to browse
                </Typography>
                <Typography variant="caption" sx={{ mt: 1, opacity: 0.8 }}>
                  Supported: CSV / Shapefile / GeoJSON / JSON
                </Typography>
              </Box>
            </section>
          );
        }}
      </Dropzone>
      {!!errorMessage && (
        <Alert severity="error">
          {errorMessage}
        </Alert>
      )}
      {!!file && (
        <Box>
          <Typography sx={{ color: "text.primary" }}>Uploaded file:</Typography>
          <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
            {file.name}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
