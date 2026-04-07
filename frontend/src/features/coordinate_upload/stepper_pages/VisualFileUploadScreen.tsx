import { Alert, Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Dropzone from "react-dropzone";
import type { FileUploadScreenProps } from "./types";
import { getDropzoneStyles } from "../../../styles/theme";

export default function VisualFileUploadScreen({
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

  return (
    <Box>
      <Typography variant="h6" sx={{ color: "text.primary", mb: 1 }}>
        Upload a coordinate file
      </Typography>
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
