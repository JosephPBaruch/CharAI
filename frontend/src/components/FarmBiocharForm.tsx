import React from 'react';
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  Stack,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { COLORS } from '../styles/colors';
import CoordinateFileUpload from './CoordinateFileUpload';
import YieldFileUpload from './YieldFileUpload';

type PriceUnit = '$/ton' | '$/kg' | '$/bushel';

interface FieldEntry {
  id: string;
  cropType: string; // Corn, Wheat, Soy, Barley, Other
  customCrop?: string;
  price: number | '';
  unit: PriceUnit;
}

const DEFAULT_FIELD = (): FieldEntry => ({
  id: String(Date.now()) + Math.random().toString(36).slice(2, 9),
  cropType: 'Wheat',
  customCrop: '',
  price: '',
  unit: '$/ton',
});

export default function FarmBiocharForm() {
  const [fields, setFields] = React.useState<FieldEntry[]>([DEFAULT_FIELD()]);
  const [globalMax, setGlobalMax] = React.useState<number | ''>('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const addField = () => setFields(prev => [...prev, DEFAULT_FIELD()]);

  const removeField = (id: string) => setFields(prev => prev.filter(f => f.id !== id));

  const updateField = (id: string, patch: Partial<FieldEntry>) => {
    setFields(prev => prev.map(f => (f.id === id ? { ...f, ...patch } : f)));
  };

  // file upload state
  const [coordUploaded, setCoordUploaded] = React.useState<boolean>(false);

  const handleCoordSelect = (file: File | null) => {
    // If a file is selected, mark coordinates as uploaded/available so the form can be submitted.
    // This covers the common case where the user selects/uploads a file and we want the
    // Submit button to enable immediately. If the parent uploader also calls
    // `onUploadComplete`, that will also set this to true.
    setCoordUploaded(!!file);
  };

  const handleCoordUploaded = () => {
    setCoordUploaded(true);
  };

  const handleYieldSelect = () => {
    // yield file is optional, no action needed on select
  };

  const handleYieldUploaded = () => {
    // yield file is optional, no action needed on upload completion
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const FormContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Title Section */}
      <Box>
        <Typography variant="h5" sx={{ color: COLORS.whiteHigh, fontWeight: 700, mb: 0.5 }}>
          Farm Configuration
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.whiteMedium }}>
          Define your fields, crops, and biochar budget allocation. Upload coordinate data to define your farm boundaries.
        </Typography>
      </Box>

      {/* Global Budget Section */}
      <Box sx={{ p: 2, backgroundColor: `${COLORS.blackMedium}`, borderRadius: 1.5, border: `1px solid ${COLORS.whiteLow}` }}>
        <Typography variant="subtitle1" sx={{ color: COLORS.whiteHigh, fontWeight: 600, mb: 1.5 }}>
          Budget Settings
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.whiteMedium, mb: 2 }}>
          Set an optional global cap on total biochar spending. This limit will be applied across all fields when distributing budget for biochar applications.
        </Typography>
        <Stack direction="row" spacing={2} alignItems="flex-end">
          <TextField
            label="Global max biochar spend"
            type="number"
            value={globalMax}
            onChange={(e) => setGlobalMax(e.target.value === '' ? '' : Number(e.target.value))}
            size="small"
            sx={{
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                color: COLORS.whiteHigh,
                '& fieldset': { borderColor: COLORS.whiteLow },
                '&:hover fieldset': { borderColor: COLORS.indigo },
              },

              // Helper text color
              '& .MuiFormHelperText-root': {
                color: COLORS.whiteMedium,
              },

              // Adornment color fixes
              '& .MuiInputAdornment-root': { color: COLORS.whiteHigh },
              '& .MuiInputBase-inputAdornedStart': { color: COLORS.whiteHigh },
              '& .MuiInputBase-inputAdornedEnd': { color: COLORS.whiteHigh },

              // Icon inside adornment
              '& .MuiSvgIcon-root': { color: COLORS.whiteHigh },

              // Label color
              '& .MuiInputLabel-root': {
                color: `${COLORS.whiteMedium} !important`,
              },
            }}
            helperText="Optional - leave blank for no limit"
          />
          <Button startIcon={<AddIcon />} variant="outlined" onClick={addField}>
            Add field
          </Button>
        </Stack>
      </Box>

      {/* Fields Section */}
      <Box>
        <Typography variant="h6" sx={{ color: COLORS.whiteHigh, fontWeight: 600, mb: 2 }}>
          Your Fields ({fields.length})
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.whiteMedium, mb: 2 }}>
          Add all fields where you plan to apply biochar. For each field, specify the crop type and current selling price to help calculate potential revenue impacts.
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {fields.map((f, idx) => (
            <Accordion 
              key={f.id} 
              defaultExpanded={fields.length === 1} 
              sx={{ 
                background: `${COLORS.blackMedium}`,
                border: `1px solid ${COLORS.whiteLow}`,
                '&:hover': { borderColor: COLORS.indigo },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: COLORS.whiteHigh }} />}>
                <Typography sx={{ color: COLORS.whiteHigh, fontWeight: 600, flex: 1 }}>
                  Field {idx + 1} — {f.cropType === 'Other' ? (f.customCrop || 'Other') : f.cropType}
                </Typography>
                {f.price && (
                  <Typography sx={{ color: COLORS.whiteMedium, mr: 2 }}>
                    ${f.price}/{f.unit}
                  </Typography>
                )}
              </AccordionSummary>
              <AccordionDetails>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="stretch">
                  {/* Crop Type */}
                  <Stack spacing={1} sx={{ minWidth: 220, flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: COLORS.whiteHigh, fontWeight: 500 }}>Crop type</Typography>
                    <Typography variant="caption" sx={{ color: COLORS.whiteMedium, mb: 0.5 }}>
                      Choose the primary crop grown in this field.
                    </Typography>
                    <Select
                      value={f.cropType}
                      onChange={(e) => updateField(f.id, { cropType: e.target.value })}
                      size="small"
                      sx={{
                        color: COLORS.whiteHigh,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.whiteLow },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.indigo },
                        '& .MuiSvgIcon-root': { color: COLORS.whiteHigh },
                      }}
                    >
                      <MenuItem value="Corn">Corn</MenuItem>
                      <MenuItem value="Wheat">Wheat</MenuItem>
                      <MenuItem value="Soy">Soy</MenuItem>
                      <MenuItem value="Barley">Barley</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>

                    {f.cropType === 'Other' && (
                      <TextField
                        label="Custom crop name"
                        size="small"
                        value={f.customCrop}
                        onChange={(e) => updateField(f.id, { customCrop: e.target.value })}
                        placeholder="e.g., Alfalfa, Oats"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: COLORS.whiteHigh,
                            '& fieldset': { borderColor: COLORS.whiteLow },
                            '&:hover fieldset': { borderColor: COLORS.indigo },
                          },
                          '& .MuiInputLabel-root': { color: `${COLORS.whiteMedium} !important` },
                        }}
                      />
                    )}
                  </Stack>

                  {/* Selling Price */}
                  <Stack spacing={1} sx={{ minWidth: 250, flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: COLORS.whiteHigh, fontWeight: 500 }}>Selling price</Typography>
                    <Typography variant="caption" sx={{ color: COLORS.whiteMedium, mb: 0.5 }}>
                      Current market price per unit
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField
                        label="Price"
                        type="number"
                        size="small"
                        value={f.price}
                        onChange={(e) => updateField(f.id, { price: e.target.value === '' ? '' : Number(e.target.value) })}
                        sx={{
                          minWidth: 120,
                          '& .MuiOutlinedInput-root': {
                            color: COLORS.whiteHigh,
                            '& fieldset': { borderColor: COLORS.whiteLow },
                            '&:hover fieldset': { borderColor: COLORS.indigo },
                          },
                          '& .MuiInputAdornment-root': { color: COLORS.whiteHigh },
                          '& .MuiInputLabel-root': { color: `${COLORS.whiteMedium} !important` },
                        }}
                      />
                      <Select
                        value={f.unit}
                        onChange={(e) => updateField(f.id, { unit: e.target.value as PriceUnit })}
                        size="small"
                        sx={{
                          color: COLORS.whiteHigh,
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.whiteLow },
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.indigo },
                          '& .MuiSvgIcon-root': { color: COLORS.whiteHigh },
                        }}
                      >
                        <MenuItem value="$/ton">$/ton</MenuItem>
                        <MenuItem value="$/kg">$/kg</MenuItem>
                        <MenuItem value="$/bushel">$/bushel</MenuItem>
                      </Select>
                    </Stack>
                  </Stack>

                  {/* Remove Button */}
                  <Stack justifyContent="flex-start">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeField(f.id);
                      }}
                      sx={{ color: 'error.light' }}
                      aria-label={`Remove field ${idx + 1}`}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>

      {/* Files Section */}
      <Box sx={{ p: 2.5, border: `1px dashed ${COLORS.indigo}`, borderRadius: 2, backgroundColor: `rgba(100, 108, 255, 0.05)` }}>
        <Typography variant="h6" sx={{ color: COLORS.indigo, fontWeight: 600, mb: 1.5 }}>
          Upload Farm Data
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.whiteMedium, mb: 2.5 }}>
          Upload geographic coordinate data (required) to define your farm boundaries. You can also optionally upload yield data to improve calculations. Supported formats: Shapefile, GeoJSON, CSV, KML, and other standard formats.
        </Typography>

        <Stack direction="column" spacing={2.5}>
          <Box sx={{ p: 2, backgroundColor: 'rgba(100, 108, 255, 0.15)', border: `2px solid ${COLORS.indigo}`, borderRadius: 1.5 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" sx={{ color: COLORS.indigo, fontWeight: 700 }}>Coordinate file</Typography>
              <Box sx={{ px: 1, py: 0.5, backgroundColor: COLORS.indigo, borderRadius: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#000000', fontWeight: 600 }}>Required</Typography>
              </Box>
            </Stack>
            <Typography variant="body2" sx={{ color: COLORS.whiteMedium, mb: 2 }}>
              Upload a file containing your farm boundary coordinates. This is essential for accurate spatial analysis and field mapping.
            </Typography>
            <CoordinateFileUpload onSelect={handleCoordSelect} onUploadComplete={handleCoordUploaded} />
            <Typography variant="caption" sx={{ color: COLORS.whiteMedium, mt: 1.5, display: 'block' }}>
              Accepted formats: Shapefile (.shp, .shx, .dbf), GeoJSON (.geojson), CSV (.csv), KML/KMZ (.kml, .kmz)
            </Typography>
          </Box>

          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle1" sx={{ color: COLORS.whiteHigh, fontWeight: 600 }}>Yield file</Typography>
              <Box sx={{ px: 1, py: 0.5, backgroundColor: COLORS.whiteLow, borderRadius: 0.5 }}>
                <Typography variant="caption" sx={{ color: COLORS.whiteMedium, fontWeight: 600 }}>Optional</Typography>
              </Box>
            </Stack>
            <Typography variant="body2" sx={{ color: COLORS.whiteMedium, mb: 2 }}>
              Upload historical yield data to enable yield-based calculations and recommendations. This helps predict potential ROI from biochar applications.
            </Typography>
            <YieldFileUpload onSelect={handleYieldSelect} onUploadComplete={handleYieldUploaded} />
            <Typography variant="caption" sx={{ color: COLORS.whiteMedium }}>
              Accepted formats: CSV (.csv), ISOXML (.xml), Shapefile (.shp), TXT (.txt)
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Submit Section */}
      <Box sx={{ p: 2, backgroundColor: `${COLORS.blackMedium}`, borderRadius: 1.5, border: `1px solid ${COLORS.whiteLow}` }}>
        <Typography variant="body2" sx={{ color: COLORS.whiteMedium, mb: 2 }}>
          Ready to proceed? Make sure you've selected all your fields and uploaded at least the coordinate file.
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="contained"
            size="large"
            disabled={!coordUploaded}
            onClick={() => {
              const payload = { globalMax, fields };
              console.log('Submit payload', payload);
              alert('Form submitted! Check console for payload details.');
            }}
            sx={{ px: 4, backgroundColor: COLORS.indigo, '&:hover': { backgroundColor: '#7a81ff' } }}
          >
            Submit request
          </Button>
          {!coordUploaded && (
            <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 500 }}>
              Upload coordinate file to enable submission
            </Typography>
          )}
          {coordUploaded && (
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
              Ready to submit
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Modal Trigger Button */}
      <Button
        variant="contained"
        onClick={openModal}
        sx={{ backgroundColor: COLORS.indigo, '&:hover': { backgroundColor: '#7a81ff' } }}
      >
        Configure Farm
      </Button>

      {/* Modal Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        maxWidth="md"
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
        <DialogTitle sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={closeModal} sx={{ color: COLORS.whiteMedium }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0, pb: 3 }}>
          <FormContent />
        </DialogContent>
      </Dialog>
    </>
  );
}
