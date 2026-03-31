import {
  Box,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { COLORS } from "../../styles/colors";

interface BiocharSettingsProps {
  biocharTonsPerHectare: number;
  biocharCostPerTon: number | "";
  onChangeTonsPerHectare: (value: number) => void;
  onChangeCostPerTon: (value: number | "") => void;
}

export default function BiocharSettings({
  biocharTonsPerHectare,
  biocharCostPerTon,
  onChangeTonsPerHectare,
  onChangeCostPerTon,
}: BiocharSettingsProps) {
  const isCostValid = biocharCostPerTon !== "" && biocharCostPerTon > 0;
  const isRateValid = biocharTonsPerHectare > 0;

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          sx={{ color: COLORS.whiteHigh, fontWeight: 600, mb: 0.5 }}
        >
          Biochar Settings
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.whiteMedium }}>
          Enter how much biochar you plan to apply and what it costs per ton.
          These values are used to compute payback period per grid cell.
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
            Biochar Application
          </Typography>
          {isCostValid && isRateValid && (
            <Typography sx={{ color: COLORS.whiteMedium, mr: 1 }}>
              {biocharTonsPerHectare} t/ha @ ${biocharCostPerTon}/ton
            </Typography>
          )}
          {!isCostValid && (
            <Typography sx={{ color: COLORS.error, fontSize: "0.8rem", mr: 1 }}>
              Cost required
            </Typography>
          )}
        </AccordionSummary>
        <AccordionDetails>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            alignItems="stretch"
          >
            {/* Application Rate */}
            <Stack spacing={1} sx={{ minWidth: 250, flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: COLORS.whiteHigh, fontWeight: 500 }}
              >
                Application rate
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: COLORS.whiteMedium, mb: 0.5 }}
              >
                How many tons of biochar to apply per hectare. Default is 20
                t/ha.
              </Typography>
              <TextField
                label="Rate"
                type="number"
                size="small"
                required
                error={!isRateValid}
                value={biocharTonsPerHectare}
                onChange={(e) => {
                  const val =
                    e.target.value === "" ? 0 : Number(e.target.value);
                  onChangeTonsPerHectare(val);
                }}
                data-testid="biochar-rate-input"
                sx={{
                  minWidth: 120,
                  "& .MuiOutlinedInput-root": {
                    color: COLORS.whiteHigh,
                    "& fieldset": {
                      borderColor: !isRateValid
                        ? COLORS.error
                        : COLORS.whiteLow,
                    },
                    "&:hover fieldset": {
                      borderColor: !isRateValid ? COLORS.error : COLORS.indigo,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: `${COLORS.whiteMedium} !important`,
                  },
                }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Box sx={{ color: COLORS.whiteHigh }}>t/ha</Box>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>

            {/* Cost Per Ton */}
            <Stack spacing={1} sx={{ minWidth: 250, flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: COLORS.whiteHigh, fontWeight: 500 }}
              >
                Cost per ton <span style={{ color: COLORS.error }}>*</span>
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: COLORS.whiteMedium, mb: 0.5 }}
              >
                Price you pay per ton of biochar (required)
              </Typography>
              <TextField
                label="Cost"
                type="number"
                size="small"
                required
                error={!isCostValid}
                value={biocharCostPerTon}
                onChange={(e) =>
                  onChangeCostPerTon(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                data-testid="biochar-cost-input"
                sx={{
                  minWidth: 120,
                  "& .MuiOutlinedInput-root": {
                    color: COLORS.whiteHigh,
                    "& fieldset": {
                      borderColor: !isCostValid
                        ? COLORS.error
                        : COLORS.whiteLow,
                    },
                    "&:hover fieldset": {
                      borderColor: !isCostValid ? COLORS.error : COLORS.indigo,
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
                    endAdornment: (
                      <InputAdornment position="end">
                        <Box sx={{ color: COLORS.whiteHigh }}>/ton</Box>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
