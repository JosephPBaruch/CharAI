import {
  Alert,
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Dropzone from "react-dropzone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { FileUploadScreenProps } from "../types";
import { getDropzoneStyles, getStepContentStyles } from "../../../styles/theme";
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
  isFileUploaded,
}: FileUploadScreenProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const dropzoneStylesThemed = getDropzoneStyles(isDark);
  const stepContentStyles = getStepContentStyles(isDark);
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
          Your file must be correctly formatted. Review the example below for
          the exact format we expect, then upload your file.
        </Typography>
      </Box>

      {/* File Format Requirements */}
      <Box sx={stepContentStyles.section}>
        <Typography
          variant="subtitle2"
          sx={{
            color: "text.primary",
            fontWeight: 600,
            mb: 1,
          }}
        >
          Required Columns
        </Typography>
        <Alert severity="info">
          Your file must contain <code>lat</code> and <code>lng</code> columns.
          Additional columns are optional and will be ignored.
        </Alert>
      </Box>

      {/* Format Selector */}
      <Box sx={stepContentStyles.section}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              textTransform: "uppercase",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            Select Format
          </Typography>
          <ToggleButtonGroup
            onChange={handleChange}
            exclusive
            value={fileExtension}
            size="small"
          >
            <ToggleButton
              value="csv"
              sx={{
                textTransform: "none",
                color: "text.primary",
                fontWeight: 500,
                fontSize: "0.875rem",
              }}
            >
              .CSV
            </ToggleButton>
            <ToggleButton
              value="json"
              sx={{
                textTransform: "none",
                color: "text.primary",
                fontWeight: 500,
                fontSize: "0.875rem",
              }}
            >
              .JSON
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Example Code Block */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.02)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`,
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            display: "block",
            mb: 1,
            textTransform: "uppercase",
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          Example {fileExtension.toUpperCase()} Format
        </Typography>
        <Box
          component="pre"
          sx={{
            color: "text.primary",
            overflow: "auto",
            margin: 0,
            fontSize: "0.85rem",
            lineHeight: 1.5,
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {fileExtension === "csv"
            ? csvExample
            : JSON.stringify(jsonExample, null, 2)}
        </Box>
      </Paper>

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
