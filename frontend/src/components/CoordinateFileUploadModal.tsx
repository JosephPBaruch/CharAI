import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import CoordinateUploadStepper from "../features/coordinate_upload/Stepper";

export default function CoordinateFileUploadModal() {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="contained"
        sx={{
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.95rem",
        }}
        data-testid="upload-coordinates-button"
      >
        Upload farm boundary coordinates
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
