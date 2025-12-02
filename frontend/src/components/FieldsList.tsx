import { Box, Button, Stack, Typography, IconButton, Accordion, AccordionSummary, AccordionDetails, TextField, Select, MenuItem, InputAdornment } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { COLORS } from '../styles/colors';

export interface FieldEntry {
  id: string;
  cropType: string;
  customCrop?: string;
  price: number | '';
  unit: 'ton' | 'kg' | 'bushel';
}

interface FieldsListProps {
  fields: FieldEntry[];
  onAddField: () => void;
  onRemoveField: (id: string) => void;
  onUpdateField: (id: string, patch: Partial<FieldEntry>) => void;
}

export default function FieldsList({ fields, onAddField, onRemoveField, onUpdateField }: FieldsListProps) {
  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="flex-end" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ color: COLORS.whiteHigh, fontWeight: 600, mb: 1 }}>
            Your Fields ({fields.length})
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.whiteMedium }}>
            Add all fields where you plan to apply biochar. For each field, specify the crop type and current selling price to help calculate potential revenue impacts.
          </Typography>
        </Box>
        <Button startIcon={<AddIcon />} size="small" variant="contained" onClick={onAddField}>
          Add field
        </Button>
      </Stack>
      
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
                    onChange={(e) => onUpdateField(f.id, { cropType: e.target.value })}
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
                      onChange={(e) => onUpdateField(f.id, { customCrop: e.target.value })}
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
                      onChange={(e) => onUpdateField(f.id, { price: e.target.value === '' ? '' : Number(e.target.value) })}
                      sx={{
                        minWidth: 120,
                        '& .MuiOutlinedInput-root': {
                          color: COLORS.whiteHigh,
                          '& fieldset': { borderColor: COLORS.whiteLow },
                          '&:hover fieldset': { borderColor: COLORS.indigo },
                        },
                        '& .MuiInputLabel-root': {
                          color: `${COLORS.whiteMedium} !important`,
                        },
                      }}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Box sx={{ color: COLORS.whiteHigh }}>$</Box>
                            </InputAdornment>
                          )
                        },
                      }}
                    />
                    <Select
                      value={f.unit}
                      onChange={(e) => onUpdateField(f.id, { unit: e.target.value as 'ton' | 'kg' | 'bushel' })}
                      size="small"
                      sx={{
                        color: COLORS.whiteHigh,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.whiteLow },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: COLORS.indigo },
                        '& .MuiSvgIcon-root': { color: COLORS.whiteHigh },
                      }}
                    >
                      <MenuItem value="ton">ton</MenuItem>
                      <MenuItem value="kg">kg</MenuItem>
                      <MenuItem value="bushel">bushel</MenuItem>
                    </Select>
                  </Stack>
                </Stack>

                {/* Remove Button */}
                <Stack justifyContent="flex-start">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveField(f.id);
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
  );
}
