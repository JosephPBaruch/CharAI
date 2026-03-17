import Dropzone from "react-dropzone";
import { Box, Typography } from "@mui/material";
import { useCallback } from "react";
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

const handleRejectedFile = () => {
  console.log("rejected!");
};

/*const handleAcceptedFile = (file: any) => {
  console.log("accepted!");
  const reader = new FileReader();

  reader.onabort = () => console.log("file reading was aborted.");
  reader.onerror = () =>
    console.error("file reading has failed. please try again later.");
  reader.onload = () => {
    const binaryString = reader.result;
    console.log(`here is our stream!: ${binaryString}`);
  };
  reader.readAsArrayBuffer(file);
};*/

const handleError = () => {
  console.log("error!");
};

const MAX_NUMBER_OF_BYTES = 1024 * 1024 * 5; // 5 MB

export default function CoordinateFileUploadModal() {
  const handleAcceptedFile = useCallback((acceptedFile: any) => {
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
  }, []);

  return (
    <Box
      sx={{
        borderRadius: 12,
        padding: 2,
        backgroundColor: COLORS.bgPage,
      }}
    >
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
    </Box>
  );
}
