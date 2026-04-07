import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  Typography,
  CircularProgress,
} from "@mui/material";
import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import CoordinateFileUploadScreen from "./stepper_pages/FileUploadScreen";
import CoordinateVisualizationScreen from "./stepper_pages/VisualizationScreen";
import ConfirmationScreen from "./stepper_pages/ConfirmationScreen";
import FileTypeSeparationScreen from "./stepper_pages/FileTypeSeparationScreen";
import type { FileTypes } from "./stepper_pages/types";
import type { LatLngLiteral } from "leaflet";
import { getStepContentStyles } from "../../styles/theme";

interface CoordinateStepperProps {
  handleClose: () => void;
}

const steps = [
  "Choose file type",
  "Upload your file",
  "Visualize your farm",
  "Confirm and finish",
];

export default function CoordinateUploadStepper({
  handleClose,
}: CoordinateStepperProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const stepContentStyles = getStepContentStyles(isDark);

  const [fileType, setFileType] = useState<FileTypes>(null);
  const [fileName, setFileName] = useState<string>("");
  const [coordinates, setCoordinates] = React.useState<LatLngLiteral[]>([]);
  const [activeStep, setActiveStep] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Validation states
  const isFileTypeSelected = fileType !== null;
  const isFileUploaded = coordinates.length > 0;
  const isVisualized = coordinates.length > 0;

  const canProceedStep1 = isFileTypeSelected;
  const canProceedStep2 = isFileUploaded;
  const canProceedStep3 = isVisualized;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      // Here you would typically make an API call to save the coordinates
      // For now, we'll just wait a moment before closing
      await new Promise((resolve) => setTimeout(resolve, 500));
      handleClose();
    } catch (error) {
      console.error("Error finishing coordinate upload:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setFileType(null);
    setFileName("");
    setCoordinates([]);
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      {/* Stepper Header */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Stepper
          variant="elevation"
          activeStep={activeStep}
          sx={{
            backgroundColor: "transparent",
            "& .MuiStepConnector-root": {
              top: 0,
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Step Content */}
      <Box
        sx={{
          ...stepContentStyles.container,
          minHeight: 300,
          position: "relative",
        }}
      >
        {/* Step 0: File Type Selection */}
        {activeStep === 0 && (
          <FileTypeSeparationScreen
            setFileType={setFileType}
            fileType={fileType}
          />
        )}

        {/* Step 1: File Upload */}
        {activeStep === 1 && (
          <CoordinateFileUploadScreen
            setCoordinates={setCoordinates}
            setFileName={setFileName}
            fileType={fileType}
            coordinates={coordinates}
          />
        )}

        {/* Step 2: Visualization */}
        {activeStep === 2 && (
          <CoordinateVisualizationScreen
            coordinates={coordinates}
            setCoordinates={setCoordinates}
          />
        )}

        {/* Step 3: Confirmation */}
        {activeStep === 3 && (
          <ConfirmationScreen
            fileName={fileName}
            coordinateCount={coordinates.length}
            coordinates={coordinates}
          />
        )}
      </Box>

      {/* Navigation Footer */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          pt: 3,
          mt: 2,
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`,
        }}
      >
        {/* Left Side: Cancel/Back */}
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            textTransform: "none",
            fontWeight: 500,
          }}
          data-testid="coordinate-upload-cancel-button"
        >
          Cancel
        </Button>

        {/* Right Side: Navigation Buttons */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Next Button (visible on steps 0-2) */}
          {activeStep < 3 && (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                isLoading ||
                (activeStep === 0 && !canProceedStep1) ||
                (activeStep === 1 && !canProceedStep2) ||
                (activeStep === 2 && !canProceedStep3)
              }
              sx={{
                textTransform: "none",
                fontWeight: 500,
                minWidth: 100,
              }}
              data-testid="coordinate-upload-next-button"
            >
              {activeStep === 2 ? "Review" : "Next"}
            </Button>
          )}

          {/* Finish Button (visible on step 3) */}
          {activeStep === 3 && (
            <Button
              variant="contained"
              onClick={handleFinish}
              disabled={isLoading}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                minWidth: 100,
                display: "flex",
                gap: 1,
              }}
              data-testid="coordinate-upload-finish-button"
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} color="inherit" />
                  Finishing...
                </>
              ) : (
                "Finish"
              )}
            </Button>
          )}
        </Box>
      </Box>

      {/* Helpful Tip */}
      {activeStep === 0 && (
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            pt: 1,
            fontStyle: "italic",
          }}
        >
          Different file formats require different handling. Choose the one that
          matches your file.
        </Typography>
      )}
    </Box>
  );
}
