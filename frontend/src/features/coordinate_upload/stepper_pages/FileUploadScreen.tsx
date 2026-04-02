import { Button } from "@mui/material";
import { useCallback, useState } from "react";
import { parseFile } from "../helpers";
import type { CoordinateFileUploadScreenProps } from "./types";
import TextFileUploadScreen from "./TextFileUploadScreen";
import VisualFileUploadScreen from "./VisualFileUploadScreen";

const acceptedTextFileTypeObject = {
  "text/csv": [".csv"],
  "application/json": [".json"],
};

const acceptedVisualFileTypeObject = {
  "application/vnd": [".kml"],
  "application/geo+json": [".geojson"],
  "appplication/zip-compressed": [".zip"],
};

const MAX_NUMBER_OF_BYTES = 1024 * 1024 * 5; // 5 MB

export default function CoordinateFileUploadScreen({
  setCoordinates,
  fileType,
  handleNext,
}: CoordinateFileUploadScreenProps) {
  const [file, setFile] = useState<any>();
  const [errorMessage, setErrorMessage] = useState("");

  const handleRejectedFile = () => {
    setErrorMessage(
      "File upload rejected! File is either too large (5MB maximum), is of an unsupported type, or multiple files are being uploaded. Please try again.",
    );
  };

  const handleError = () => {
    setErrorMessage("Uh oh! An unexpected error occurred. Please try again.");
  };

  const handleAcceptedFile = useCallback(
    async (acceptedFile: File[]) => {
      setErrorMessage("");

      const file = acceptedFile[0];
      const result = await parseFile(file);

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      setCoordinates(result.data);
      setFile(file);
    },
    [setCoordinates],
  );

  /*if (fileType === "text") {
    return (
      <TextFileUploadScreen
        MAX_NUMBER_OF_BYTES={MAX_NUMBER_OF_BYTES}
        acceptedFileTypeObject={acceptedTextFileTypeObject}
        handleAcceptedFile={handleAcceptedFile}
        handleRejectedFile={handleRejectedFile}
        handleError={handleError}
        errorMessage={errorMessage}
        file={file}
      />
    );
  } else if (fileType === "visual") {
    return (
      <VisualFileUploadScreen
        MAX_NUMBER_OF_BYTES={MAX_NUMBER_OF_BYTES}
        acceptedFileTypeObject={acceptedVisualFileTypeObject}
        handleAcceptedFile={handleAcceptedFile}
        handleRejectedFile={handleRejectedFile}
        handleError={handleError}
        errorMessage={errorMessage}
        file={file}
      />
    );
  } else {
    return <Typography>Error! You have not selected a file type!</Typography>;
    // TODO: add safeguards / rerouting here. the user should've selected a file type at this point.
  }*/

  return (
    <>
      {fileType === "text" ? (
        <TextFileUploadScreen
          MAX_NUMBER_OF_BYTES={MAX_NUMBER_OF_BYTES}
          acceptedFileTypeObject={acceptedTextFileTypeObject}
          handleAcceptedFile={handleAcceptedFile}
          handleRejectedFile={handleRejectedFile}
          handleError={handleError}
          errorMessage={errorMessage}
          file={file}
        />
      ) : (
        <VisualFileUploadScreen
          MAX_NUMBER_OF_BYTES={MAX_NUMBER_OF_BYTES}
          acceptedFileTypeObject={acceptedVisualFileTypeObject}
          handleAcceptedFile={handleAcceptedFile}
          handleRejectedFile={handleRejectedFile}
          handleError={handleError}
          errorMessage={errorMessage}
          file={file}
        />
      )}
      <Button onClick={handleNext}>Next</Button>
    </>
  );
}
