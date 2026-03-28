import { Alert, Box, Typography } from "@mui/material";
import Dropzone from "react-dropzone";
import { COLORS } from "../../../styles/colors";
import type { FileUploadScreenProps } from "./types";
import { dropzoneStyles } from "../../../styles/styles";

export default function VisualFileUploadScreen({
  MAX_NUMBER_OF_BYTES,
  acceptedFileTypeObject,
  handleRejectedFile,
  handleAcceptedFile,
  handleError,
  errorMessage,
  file,
}: FileUploadScreenProps) {
  return (
    <Box>
      <Typography variant="h6" sx={{ color: COLORS.whiteHigh, mb: 1 }}>
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
