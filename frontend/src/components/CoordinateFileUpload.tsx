import { Box, Button, IconButton, Stack, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { uploadCoordinateFile } from "../services/fileUploadService";
import { COLORS } from "../styles/colors";

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function CoordinateFileUpload() {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files === null) {
      throw Error("Error: No files selected");
    }
    setSelectedFile(event.target.files[0]);
  };

  const handleFileSubmit = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await uploadCoordinateFile(formData);
      if (response) {
        console.log("Success! File uploaded");
        setSelectedFile(null);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-start' }}>
      {!selectedFile ? (
        <Button
          variant="contained"
          component="label"
          sx={{ textTransform: 'none', fontSize: '1rem' }}
        >
          Choose file
          <VisuallyHiddenInput
            type="file"
            onChange={handleFileChange}
          />
        </Button>
      ) : (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center',
            padding: 1.5,
            backgroundColor: 'rgba(100, 108, 255, 0.1)',
            border: `1px solid ${COLORS.indigo}`,
            borderRadius: 1,
            minWidth: 300,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              flex: 1,
              color: COLORS.whiteHigh,
              wordBreak: 'break-word',
            }}
          >
            {selectedFile.name}
          </Typography>
          <IconButton
            size="small"
            onClick={handleClearFile}
            disabled={isLoading}
            sx={{ color: COLORS.whiteHigh }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      )}

      {selectedFile && (
        <Button
          variant="contained"
          onClick={handleFileSubmit}
          disabled={isLoading}
          sx={{ textTransform: 'none', fontSize: '1rem' }}
        >
          {isLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
          {isLoading ? 'Uploading...' : 'Submit file'}
        </Button>
      )}
    </Box>
  );
}