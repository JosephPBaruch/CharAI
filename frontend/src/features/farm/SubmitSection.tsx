import { Box, Button, Stack, Typography } from '@mui/material';
import { COLORS } from '../../styles/colors';

interface SubmitSectionProps {
  coordsReady: boolean;
  onSubmit: () => void;
}

export default function SubmitSection({ coordsReady, onSubmit }: SubmitSectionProps) {
  return (
    <Box sx={{ p: 2, backgroundColor: `${COLORS.blackMedium}`, borderRadius: 1.5, border: `1px solid ${COLORS.whiteLow}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
      <Typography variant="body2" sx={{ color: COLORS.whiteMedium }}>
        Ready to proceed? Make sure you've selected all your fields and uploaded at least the coordinate file.
      </Typography>
      <Stack direction="column" spacing={2} alignItems="center">
        <Button
          variant="contained"
          size="large"
          disabled={!coordsReady}
          onClick={onSubmit}
          sx={{ 
            px: 4, 
            backgroundColor: COLORS.indigo, 
            '&:hover': { backgroundColor: COLORS.indigoHover },
            '&:disabled': {
              backgroundColor: COLORS.indigo,
              opacity: 0.6,
              color: COLORS.whiteHigh,
            }
          }}
        >
          Submit request
        </Button>
        {!coordsReady && (
          <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 500 }}>
            Upload or draw your boundary to enable submission
          </Typography>
        )}
        {coordsReady && (
          <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
            Boundary received - ready to submit
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
