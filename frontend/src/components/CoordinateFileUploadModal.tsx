import Dropzone from "react-dropzone";
import { Alert, Box, Button, Modal, Typography } from "@mui/material";
import { useCallback, useState } from "react";
import { COLORS } from "../styles/colors";

const acceptedFileTypeObject = {
  "text/csv": [".csv"],
  "application/vnd": [".shp", ".shx", ".dbf", ".kml"],
  "application/json": [".json"],
  "application/geo+json": [".geojson"],
};

const dropzoneStyles = {
  base: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 16,
    borderColor: COLORS.whiteLow,
    backgroundColor: COLORS.bgCard,
    color: COLORS.whiteHigh,
    transition: "border-color 0.24s ease, background-color 0.24s ease",
    padding: "1.5rem",
    minHeight: 160,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  active: {
    borderColor: COLORS.indigo,
    backgroundColor: COLORS.indigoLight,
  },
  reject: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight,
  },
};

const MAX_NUMBER_OF_BYTES = 1024 * 1024 * 5; // 5 MB

export default function CoordinateFileUploadModal() {
  const [file, setFile] = useState<any>();
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState<boolean>(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // temporary
  const [coordinates, setCoordinates] = useState({});

  const handleRejectedFile = () => {
    setErrorMessage(
      "File upload rejected! File is either too large (5MB maximum), is of an unsupported type, or multiple files are being uploaded. Please try again.",
    );
  };

  const handleError = () => {
    setErrorMessage("Uh oh! An unexpected error occurred. Please try again.");
  };

  const handleAcceptedFile = useCallback((acceptedFile: any) => {
    setErrorMessage("");
    acceptedFile.forEach((file: any) => {
      const reader = new FileReader();

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        // Do whatever you want with the file contents
        const binaryStr = reader.result;
        console.log(binaryStr);
      };
      reader.readAsText(file);
    });
    setCoordinates(parseFile(acceptedFile[0]));
    setFile(acceptedFile[0]);
  }, []);

  return (
    <>
      <Button
        onClick={handleOpen}
        sx={{
          backgroundColor: COLORS.indigo,
          "&:hover": { backgroundColor: COLORS.indigoHover },
          textTransform: "none",
          fontSize: "0.95rem",
        }}
        variant="contained"
      >
        Upload farm boundary coordinates
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        sx={{
          borderRadius: 12,
          padding: 2,
          backgroundColor: COLORS.bgPage,
        }}
      >
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
      </Modal>
    </>
  );
}
