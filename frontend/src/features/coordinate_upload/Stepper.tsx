import { Box, Step, StepLabel, Stepper } from "@mui/material";
import React, { useState } from "react";
import CoordinateFileUploadScreen from "./stepper_pages/FileUploadScreen";
import CoordinateVisualizationScreen from "./stepper_pages/VisualizationScreen";
import FileTypeSeparationScreen from "./stepper_pages/FileTypeSeparationScreen";
import type { FileTypes } from "./stepper_pages/types";
import type { LatLngLiteral } from "leaflet";

const steps = [
  "Upload your coordinate file",
  "Validate the parsed data",
  "Visualize your farm and confirm",
];

export default function CoordinateUploadStepper({
  handleClose,
}: CoordinateStepperProps) {
  const [fileType, setFileType] = useState<FileTypes>(null);

  const [coordinates, setCoordinates] = React.useState<LatLngLiteral[]>([]);
  const [activeStep, setActiveStep] = React.useState<number>(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleRedirectToManual = () => {};
  return (
    <Box sx={{ width: "100%" }}>
      <Stepper variant="elevation" activeStep={activeStep}>
        {steps.map((label) => {
          const stepProps: { completed?: boolean } = {};
          return (
            <Step key={label} {...stepProps}>
              <StepLabel>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === 0 && (
        <FileTypeSeparationScreen
          setFileType={setFileType}
          handleNext={handleNext}
        />
      )}
      {activeStep === 1 && (
        <CoordinateFileUploadScreen
          setCoordinates={setCoordinates}
          fileType={fileType}
          handleNext={handleNext}
        />
      )}
      {activeStep === 2 && (
        <CoordinateVisualizationScreen
          coordinates={coordinates}
          setCoordinates={setCoordinates}
        />
      )}
    </Box>
  );
}
