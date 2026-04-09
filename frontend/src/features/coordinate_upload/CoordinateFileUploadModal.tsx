import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import CoordinateUploadStepper from "./Stepper";

interface CoordinateFileUploadModalProps {
  hasCoordinates?: boolean;
}

export default function CoordinateFileUploadModal({
  hasCoordinates = false,
}: CoordinateFileUploadModalProps) {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="contained"
        fullWidth
        sx={{
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.95rem",
        }}
        data-testid="upload-coordinates-button"
      >
        {hasCoordinates
          ? "Re-upload farm boundary coordinates"
          : "Upload farm boundary coordinates"}
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pr: 1,
          }}
        >
          Upload Farm Boundary
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{ ml: 2 }}
            data-testid="coordinate-upload-dialog-close-button"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <CoordinateUploadStepper handleClose={handleClose} />
        </DialogContent>
      </Dialog>
    </>
  );
}
