import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Typography, Divider, Paper, Stack } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { COLORS } from "../styles/colors";
import React from "react";
import InteractiveFarmMap from "./InteractiveFarmMap";
import { type LatLngLiteral } from "leaflet";

export default function ManualCoordinateUpload() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [markers, setMarkers] = React.useState<LatLngLiteral[]>([]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setMarkers([]);
  };

  const handleClearMarkers = () => {
    setMarkers([]);
  };

  const handleSubmit = () => {
    console.log("Submitted coordinates:", markers);
    // TODO: Implement submission logic
    closeModal();
  };
  
  return (
    <>
      <Button
        variant="contained"
        onClick={openModal}
        sx={{ 
          backgroundColor: COLORS.indigo, 
          '&:hover': { backgroundColor: '#7a81ff' },
          textTransform: 'none',
          fontSize: '0.95rem',
        }}
      >
        Manually upload coordinates
      </Button>

      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#0a0a0a',
            backgroundImage: 'none',
            color: COLORS.whiteHigh,
            height: '92vh',
            maxHeight: '92vh',
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <IconButton 
              onClick={closeModal} 
              sx={{ 
                color: COLORS.whiteHigh, 
                gap: 1,
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' }
              }}
            >
              <ArrowBackIcon/>
              <Typography sx={{ fontSize: '0.95rem' }}>Back</Typography>
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Define Field Boundaries
            </Typography>
            <Box sx={{ width: 80 }} /> {/* Spacer for centering */}
          </Box>
        </DialogTitle>
        
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
        
        <DialogContent sx={{ pt: 2, pb: 2, px: 4, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
            {/* Map Section - Takes most of the space */}
            <Box sx={{ 
              flex: 1,
              minWidth: 0,
              borderRadius: 2, 
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
            }}>
              <InteractiveFarmMap markers={markers} setMarkers={setMarkers} />
            </Box>

            {/* Sidebar - Instructions and Controls */}
            <Box sx={{ 
              width: '380px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2,
              flexShrink: 0 
            }}>
              {/* Instructions Section */}
              <Paper 
                elevation={0}
                sx={{ 
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: 2,
                  p: 2,
                  flexShrink: 0
                }}
              >
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: COLORS.indigo, fontSize: '1rem' }}>
                  How to use:
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2" sx={{ color: COLORS.whiteMedium, lineHeight: 1.6, fontSize: '0.85rem' }}>
                    • <strong>Click on the map</strong> to place boundary markers for your field
                  </Typography>
                  <Typography variant="body2" sx={{ color: COLORS.whiteMedium, lineHeight: 1.6, fontSize: '0.85rem' }}>
                    • <strong>Place at least 3 markers</strong> to define a field boundary (polygon will appear automatically)
                  </Typography>
                  <Typography variant="body2" sx={{ color: COLORS.whiteMedium, lineHeight: 1.6, fontSize: '0.85rem' }}>
                    • Use <strong>Clear Markers</strong> to start over if needed
                  </Typography>
                  <Typography variant="body2" sx={{ color: COLORS.whiteMedium, lineHeight: 1.6, fontSize: '0.85rem' }}>
                    • Click <strong>Submit</strong> when you're satisfied with your field boundaries
                  </Typography>
                </Stack>
              </Paper>

              {/* Status */}
              <Box sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
                p: 1.5,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box>
                  <Typography variant="body2" sx={{ color: COLORS.whiteMedium, fontSize: '0.85rem' }}>
                    <strong>Markers placed:</strong>
                  </Typography>
                  {markers.length >= 3 && (
                    <Typography variant="body2" sx={{ color: '#4ade80', fontSize: '0.8rem', mt: 0.3 }}>
                      Boundary defined
                    </Typography>
                  )}
                </Box>
                <Typography variant="body1" sx={{ color: COLORS.whiteHigh, fontWeight: 600 }}>
                  {markers.length}
                </Typography>
              </Box>

              {/* Spacer to push buttons to bottom */}
              <Box sx={{ flex: 1 }} />

              {/* Action Buttons */}
              <Stack spacing={1.5}>
                <Button
                  variant="outlined"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={handleClearMarkers}
                  disabled={markers.length === 0}
                  fullWidth
                  sx={{
                    borderColor: 'rgba(239, 68, 68, 0.5)',
                    color: '#ef4444',
                    textTransform: 'none',
                    py: 1.2,
                    '&:hover': {
                      borderColor: '#ef4444',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)'
                    },
                    '&:disabled': {
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      color: 'rgba(255, 255, 255, 0.3)'
                    }
                  }}
                >
                  Clear Markers
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={handleSubmit}
                  disabled={markers.length < 3}
                  fullWidth
                  sx={{
                    backgroundColor: COLORS.indigo,
                    textTransform: 'none',
                    py: 1.2,
                    '&:hover': {
                      backgroundColor: '#7a81ff'
                    },
                    '&:disabled': {
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      color: 'rgba(255, 255, 255, 0.3)'
                    }
                  }}
                >
                  Submit Coordinates
                </Button>
              </Stack>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}