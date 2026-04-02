import {
  Alert,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import Dropzone from "react-dropzone";
import { COLORS } from "../../../styles/colors";
import type { FileUploadScreenProps } from "./types";
import { dropzoneStyles } from "../../../styles/styles";
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
      <Typography variant="h6" sx={{ color: COLORS.whiteHigh, mb: 1 }}>
        Upload a coordinate file
      </Typography>
      <Typography>
        Before you upload a file, it must be correctly formatted. Review the
        formats below to see what we are expecting, and please adjust your file
        accordingly.
      </Typography>
      <Typography>
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
          sx={{ textTransform: "none", color: COLORS.whiteHigh, mb: 1 }}
        >
          .csv
        </ToggleButton>
        <ToggleButton
          value="json"
          sx={{ textTransform: "none", color: COLORS.whiteHigh, mb: 1 }}
        >
          .json
        </ToggleButton>
      </ToggleButtonGroup>
      {fileExtension === "csv" ? (
        <pre>{csvExample}</pre>
      ) : (
        <pre>{JSON.stringify(jsonExample, null, 2)}</pre>
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
            ...dropzoneStyles.base,
            ...(isDragActive ? dropzoneStyles.active : {}),
            ...(isDragReject ? dropzoneStyles.reject : {}),
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
        <Alert
          severity="error"
          sx={{
            backgroundColor: `${COLORS.error}20`,
            color: COLORS.error,
            border: `1px solid ${COLORS.error}`,
            "& .MuiAlert-icon": {
              color: COLORS.error,
            },
          }}
        >
          {errorMessage}
        </Alert>
      )}
      {!!file && (
        <Box>
          <Typography>Uploaded file:</Typography>
          <Typography variant="subtitle2">{file.name}</Typography>
        </Box>
      )}
    </Box>
  );
}
