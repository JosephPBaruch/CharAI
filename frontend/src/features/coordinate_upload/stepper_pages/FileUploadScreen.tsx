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
  setFileName,
  fileType,
  coordinates,
}: CoordinateFileUploadScreenProps) {
  const [file, setFile] = useState<File | null>(null);
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
    async (acceptedFiles: File[]) => {
      setErrorMessage("");

      const uploadedFile = acceptedFiles[0];
      const result = await parseFile(uploadedFile);

      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }

      setCoordinates(result.data);
      setFileName(uploadedFile.name);
      setFile(uploadedFile);
    },
    [setCoordinates, setFileName],
  );

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
          isFileUploaded={coordinates.length > 0}
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
          isFileUploaded={coordinates.length > 0}
        />
      )}
    </>
  );
}
