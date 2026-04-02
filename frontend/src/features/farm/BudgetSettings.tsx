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
import { useTheme } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
  const theme = useTheme();
  const isCostValid = biocharCostPerTon !== "" && biocharCostPerTon > 0;
  const isRateValid = biocharTonsPerHectare > 0;

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          sx={{ color: "text.primary", fontWeight: 600, mb: 0.5 }}
        >
          Biochar Settings
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Enter how much biochar you plan to apply and what it costs per ton.
          These values are used to compute payback period per grid cell.
        </Typography>
      </Box>

      <Accordion
        defaultExpanded
        sx={{
          backgroundColor: theme.palette.mode === "dark"
            ? "rgba(0, 0, 0, 0.3)"
            : "rgba(0, 0, 0, 0.02)",
          border: `1px solid ${theme.palette.divider}`,
          "&:hover": { borderColor: theme.palette.primary.main },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "text.primary" }} />}
          sx={{ "& .MuiAccordionSummary-content": { alignItems: "center" } }}
        >
          <Typography
            sx={{ color: "text.primary", fontWeight: 600, flex: 1 }}
          >
            Biochar Application
          </Typography>
          {isCostValid && isRateValid && (
            <Typography sx={{ color: "text.secondary", mr: 1 }}>
              {biocharTonsPerHectare} t/ha @ ${biocharCostPerTon}/ton
            </Typography>
          )}
          {!isCostValid && (
            <Typography sx={{ color: "error.main", fontSize: "0.8rem", mr: 1 }}>
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
                sx={{ color: "text.primary", fontWeight: 500 }}
              >
                Application rate
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", mb: 0.5 }}
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
                sx={{ minWidth: 120 }}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Box sx={{ color: "text.secondary" }}>t/ha</Box>
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
                sx={{ color: "text.primary", fontWeight: 500 }}
              >
                Cost per ton <span style={{ color: theme.palette.error.main }}>*</span>
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", mb: 0.5 }}
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
                sx={{ minWidth: 120 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{ color: "text.secondary" }}>$</Box>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Box sx={{ color: "text.secondary" }}>/ton</Box>
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
