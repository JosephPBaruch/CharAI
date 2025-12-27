import { Box, TextField, Typography, InputAdornment } from '@mui/material';
import { COLORS } from '../../styles/colors';

interface BudgetSettingsProps {
  globalMax: number | '';
  onChange: (value: number | '') => void;
}

export default function BudgetSettings({ globalMax, onChange }: BudgetSettingsProps) {
  return (
    <Box sx={{ p: 2, backgroundColor: `${COLORS.blackMedium}`, borderRadius: 1.5, border: `1px solid ${COLORS.whiteLow}` }}>
      <Typography variant="subtitle1" sx={{ color: COLORS.whiteHigh, fontWeight: 600, mb: 1.5 }}>
        Budget Settings
      </Typography>
      <Typography variant="body2" sx={{ color: COLORS.whiteMedium, mb: 3 }}>
        Set an optional global cap on total biochar spending. This limit will be applied across all fields when distributing budget for biochar applications.
      </Typography>
      <TextField
        label="Global max biochar spend"
        type="number"
        value={globalMax}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
        size="small"
        inputProps={{ maxLength: 10 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Box sx={{ color: COLORS.whiteHigh }}>$</Box>
              </InputAdornment>
            )
          },
        }}
        sx={{
          minWidth: 250,
          '& .MuiOutlinedInput-root': {
            color: COLORS.whiteHigh,
            '& fieldset': { borderColor: COLORS.whiteLow },
            '&:hover fieldset': { borderColor: COLORS.indigo },
          },
          '& .MuiFormHelperText-root': {
            color: COLORS.whiteMedium,
          },
          '& .MuiSvgIcon-root': { color: COLORS.whiteHigh },
          '& .MuiInputLabel-root': {
            color: `${COLORS.whiteMedium} !important`,
          },
        }}
        helperText="Optional - leave blank for no limit"
      />
    </Box>
  );
}
