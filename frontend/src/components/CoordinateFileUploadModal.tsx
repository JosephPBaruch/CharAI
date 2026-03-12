import Dropzone from "react-dropzone";
import { Box, Typography } from "@mui/material";
import { useCallback } from "react";

const acceptedFileTypeObject = {
  "text/csv": [".csv"],
  "application/vnd": [".shp", ".shx", ".dbf", ".kml"],
  "application/json": [".json"],
  "application/geo+json": [".geojson"],
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
    <Box>
      <Typography>This is the file upload modal:</Typography>
      <Dropzone
        accept={acceptedFileTypeObject}
        maxFiles={1}
        maxSize={MAX_NUMBER_OF_BYTES}
        onDropRejected={handleRejectedFile}
        onDropAccepted={handleAcceptedFile}
        onError={handleError}
      >
        {({ getRootProps, getInputProps }) => (
          <section className="dropzone">
            <Box {...getRootProps({ className: "dropzone" })}>
              <input {...getInputProps()} />
              <Typography>
                Drag 'n' drop some files here, or click to select files
              </Typography>
            </Box>
            <Typography>Files</Typography>
          </section>
        )}
      </Dropzone>
    </Box>
  );
}
