import { Alert, Box, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Dropzone from "react-dropzone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { FileUploadScreenProps } from "../types";
import { getDropzoneStyles, getStepContentStyles } from "../../../styles/theme";

export default function VisualFileUploadScreen({
  MAX_NUMBER_OF_BYTES,
  acceptedFileTypeObject,
  handleRejectedFile,
  handleAcceptedFile,
  handleError,
  errorMessage,
  file,
  isFileUploaded,
}: FileUploadScreenProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const dropzoneStylesThemed = getDropzoneStyles(isDark);
  const stepContentStyles = getStepContentStyles(isDark);

  return (
    <Box sx={stepContentStyles.container}>
      {/* Header */}
      <Box sx={stepContentStyles.section}>
        <Typography
          variant="h5"
          sx={{
            color: "text.primary",
            fontWeight: 600,
          }}
        >
          Upload your file
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            lineHeight: 1.6,
          }}
        >
          GeoJSON, KML, and Shapefile formats are self-contained and already
          include all necessary geographic information. Simply upload your file
          and we'll extract the boundary coordinates.
        </Typography>
      </Box>

      {/* Supported Formats Information */}
      <Box sx={stepContentStyles.section}>
        <Typography
          variant="subtitle2"
          sx={{
            color: "text.primary",
            fontWeight: 600,
            mb: 1,
          }}
        >
          Supported Formats
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Alert severity="info">
            <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
              <strong>GeoJSON (.geojson):</strong> Standard web format for
              geographic data
            </Typography>
            <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
              <strong>KML (.kml):</strong> Keyhole Markup Language (used by
              Google Earth)
            </Typography>
            <Typography variant="caption">
              <strong>Shapefile (.shp, .dbf, .shx):</strong> Upload as a ZIP
              archive containing all required files
            </Typography>
          </Alert>
        </Box>
      </Box>

      {/* Dropzone */}
      <Box sx={stepContentStyles.section}>
        <Dropzone
          accept={acceptedFileTypeObject}
          maxFiles={1}
          maxSize={MAX_NUMBER_OF_BYTES}
          onDropRejected={handleRejectedFile}
          onDropAccepted={handleAcceptedFile}
          onError={handleError}
          disabled={isFileUploaded}
        >
          {({ getRootProps, getInputProps, isDragActive, isDragReject }) => {
            const dropzoneSx = {
              ...dropzoneStylesThemed.base,
              ...(isDragActive ? dropzoneStylesThemed.active : {}),
              ...(isDragReject ? dropzoneStylesThemed.reject : {}),
              ...(isFileUploaded
                ? {
                    opacity: 0.6,
                    cursor: "default",
                  }
                : {}),
            };

            return (
              <section>
                <Box {...getRootProps({ style: dropzoneSx })}>
                  <input {...getInputProps()} />
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    Drag and drop your file here, or click to browse
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Max file size: 5 MB
                  </Typography>
                </Box>
              </section>
            );
          }}
        </Dropzone>
      </Box>

      {/* Error Message */}
      {errorMessage && (
        <Alert severity="error" onClose={() => {}} sx={{ mt: 1 }}>
          {errorMessage}
        </Alert>
      )}

      {/* File Uploaded Success State */}
      {isFileUploaded && file && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            display: "flex",
            alignItems: "flex-start",
            gap: 2,
            backgroundColor: isDark
              ? "rgba(34, 197, 94, 0.05)"
              : "rgba(34, 197, 94, 0.02)",
            border: `1px solid rgba(34, 197, 94, 0.3)`,
            borderRadius: 1,
          }}
        >
          <CheckCircleIcon
            sx={{
              color: "success.main",
              fontSize: 24,
              flexShrink: 0,
              mt: 0.5,
            }}
          />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: "text.primary",
                fontWeight: 600,
              }}
            >
              File uploaded successfully
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                wordBreak: "break-word",
              }}
            >
              {file.name}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
