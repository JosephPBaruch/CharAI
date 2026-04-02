import { Button, Modal } from "@mui/material";
import { useState } from "react";
import { COLORS } from "../styles/colors";
import CoordinateUploadStepper from "../features/coordinate_upload/Stepper";
import CloseIcon from "@mui/icons-material/Close";

export default function CoordinateFileUploadModal() {
  const [open, setOpen] = useState<boolean>(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button
        onClick={handleOpen}
        sx={{
          backgroundColor: COLORS.indigo,
          "&:hover": { backgroundColor: COLORS.indigoHover },
          textTransform: "none",
          fontSize: "0.95rem",
        }}
        variant="contained"
      >
        Upload farm boundary coordinates
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        sx={{
          borderRadius: 12,
          padding: 2,
          backgroundColor: COLORS.bgPage,
        }}
      >
        <CoordinateUploadStepper />
      </Modal>
    </>
  );
}
