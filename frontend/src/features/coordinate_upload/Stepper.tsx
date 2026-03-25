import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import React from "react";
import CoordinateFileUploadScreen from "./stepper_pages/FileUploadScreen";

const steps = [
  "Upload your coordinate file",
  "Validate the parsed data",
  "Visualize your farm and confirm",
];

export default function CoordinateUploadStepper() {
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
  return (
    <Box sx={{ width: "100%" }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => {
          const stepProps: { completed?: boolean } = {};
          return (
            <Step key={label} {...stepProps}>
              <StepLabel>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === 0 && <CoordinateFileUploadScreen />}
      {activeStep === 1 && <Typography>Step 2!</Typography>}
      {activeStep === 2 && <Typography>Step 3!</Typography>}
      <Button onClick={handleNext} variant="contained">
        Next Step
      </Button>
      <Button onClick={handleBack} variant="text">
        Last Step
      </Button>
      <Button onClick={handleReset} variant="outlined">
        Reset Steps
      </Button>
    </Box>
  );
}
