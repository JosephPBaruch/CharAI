import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { COLORS } from "../styles/colors";
import React from "react";
import InteractiveFarmMap from "./InteractiveFarmMap";

export default function ManualCoordinateUpload() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const FormContent = () => {
    return (
      <Box>
        Hello World.
        <InteractiveFarmMap/>
      </Box>
    )
  }
  
  return (
    <>
      <Button
        variant="contained"
        onClick={openModal}
        sx={{ backgroundColor: COLORS.indigo, '&:hover': { backgroundColor: '#7a81ff' } }}
      >
        Manually upload coordinates
      </Button>

      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#000000',
            backgroundImage: 'none',
            color: COLORS.whiteHigh,
            maxHeight: '90vh',
            overflowY: 'auto',
          }
        }}
      >
        <DialogTitle>
          <IconButton onClick={closeModal} sx={{ color: COLORS.whiteHigh, gap: 1 }}>
            <ArrowBackIcon/>
            <Typography>Back</Typography>
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0, pb: 3 }}>
          <FormContent />
        </DialogContent>
      </Dialog>
    </>
  )
}