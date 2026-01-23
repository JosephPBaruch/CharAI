import {
  Box,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Select,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { COLORS } from "../../styles/colors";

export interface FieldEntry {
  id: string;
  cropType: string;
  customCrop?: string;
  price: number | "";
  unit: "ton" | "kg" | "bushel";
}

interface FieldsListProps {
  field: FieldEntry;
  onUpdateField: (patch: Partial<FieldEntry>) => void;
}

export default function FieldsList({ field, onUpdateField }: FieldsListProps) {
  const isPriceValid = field.price !== "" && field.price > 0;

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          sx={{ color: COLORS.whiteHigh, fontWeight: 600, mb: 0.5 }}
        >
          Field Configuration
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.whiteMedium }}>
          Configure your field's crop type and current selling price to
          calculate biochar ROI.
        </Typography>
      </Box>

      <Accordion
        defaultExpanded
        sx={{
          background: `${COLORS.blackMedium}`,
          border: `1px solid ${COLORS.whiteLow}`,
          "&:hover": { borderColor: COLORS.indigo },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: COLORS.whiteHigh }} />}
          sx={{ "& .MuiAccordionSummary-content": { alignItems: "center" } }}
        >
          <Typography
            sx={{ color: COLORS.whiteHigh, fontWeight: 600, flex: 1 }}
          >
            {field.cropType === "Other"
              ? field.customCrop || "Other"
              : field.cropType}
          </Typography>
          {field.price && (
            <Typography sx={{ color: COLORS.whiteMedium, mr: 1 }}>
              ${field.price}/{field.unit}
            </Typography>
          )}
          {!isPriceValid && (
            <Typography sx={{ color: COLORS.error, fontSize: "0.8rem", mr: 1 }}>
              Price required
            </Typography>
          )}
        </AccordionSummary>
        <AccordionDetails>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            alignItems="stretch"
          >
            {/* Crop Type */}
            <Stack spacing={1} sx={{ minWidth: 220, flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: COLORS.whiteHigh, fontWeight: 500 }}
              >
                Crop type
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: COLORS.whiteMedium, mb: 0.5 }}
              >
                Choose the primary crop grown in your field.
              </Typography>
              <Select
                value={field.cropType}
                onChange={(e) => onUpdateField({ cropType: e.target.value })}
                size="small"
                sx={{
                  color: COLORS.whiteHigh,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: COLORS.whiteLow,
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: COLORS.indigo,
                  },
                  "& .MuiSvgIcon-root": { color: COLORS.whiteHigh },
                }}
              >
                <MenuItem value="Corn">Corn</MenuItem>
                <MenuItem value="Wheat">Wheat</MenuItem>
                <MenuItem value="Soy">Soy</MenuItem>
                <MenuItem value="Barley">Barley</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>

              {field.cropType === "Other" && (
                <TextField
                  label="Custom crop name"
                  size="small"
                  value={field.customCrop}
                  onChange={(e) =>
                    onUpdateField({ customCrop: e.target.value })
                  }
                  placeholder="e.g., Alfalfa, Oats"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: COLORS.whiteHigh,
                      "& fieldset": { borderColor: COLORS.whiteLow },
                      "&:hover fieldset": { borderColor: COLORS.indigo },
                    },
                    "& .MuiInputLabel-root": {
                      color: `${COLORS.whiteMedium} !important`,
                    },
                  }}
                />
              )}
            </Stack>

            {/* Selling Price */}
            <Stack spacing={1} sx={{ minWidth: 250, flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: COLORS.whiteHigh, fontWeight: 500 }}
              >
                Selling price <span style={{ color: COLORS.error }}>*</span>
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: COLORS.whiteMedium, mb: 0.5 }}
              >
                Current market price per unit (required)
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label="Price"
                  type="number"
                  size="small"
                  required
                  error={!isPriceValid}
                  value={field.price}
                  onChange={(e) =>
                    onUpdateField({
                      price:
                        e.target.value === "" ? "" : Number(e.target.value),
                    })
                  }
                  sx={{
                    minWidth: 120,
                    "& .MuiOutlinedInput-root": {
                      color: COLORS.whiteHigh,
                      "& fieldset": {
                        borderColor: !isPriceValid
                          ? COLORS.error
                          : COLORS.whiteLow,
                      },
                      "&:hover fieldset": {
                        borderColor: !isPriceValid
                          ? COLORS.error
                          : COLORS.indigo,
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: `${COLORS.whiteMedium} !important`,
                    },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Box sx={{ color: COLORS.whiteHigh }}>$</Box>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Select
                  value={field.unit}
                  onChange={(e) =>
                    onUpdateField({
                      unit: e.target.value as "ton" | "kg" | "bushel",
                    })
                  }
                  size="small"
                  sx={{
                    color: COLORS.whiteHigh,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: COLORS.whiteLow,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: COLORS.indigo,
                    },
                    "& .MuiSvgIcon-root": { color: COLORS.whiteHigh },
                  }}
                >
                  <MenuItem value="ton">ton</MenuItem>
                  <MenuItem value="kg">kg</MenuItem>
                  <MenuItem value="bushel">bushel</MenuItem>
                </Select>
              </Stack>
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
