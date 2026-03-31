import { Box, Button, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface SubmitSectionProps {
  coordsReady: boolean;
  onSubmit: () => void;
}

export default function SubmitSection({
  coordsReady,
  onSubmit,
}: SubmitSectionProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: theme.palette.mode === "dark"
          ? "rgba(0, 0, 0, 0.3)"
          : "rgba(0, 0, 0, 0.02)",
        borderRadius: 1.5,
        border: `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        Ready to proceed? Make sure you've selected all your fields and uploaded
        at least the coordinate file.
      </Typography>
      <Stack direction="column" spacing={2} alignItems="center">
        <Button
          variant="contained"
          size="large"
          disabled={!coordsReady}
          onClick={onSubmit}
          sx={{ px: 4 }}
        >
          Submit request
        </Button>
        {!coordsReady && (
          <Typography
            variant="body2"
            sx={{ color: "warning.main", fontWeight: 500 }}
          >
            Upload or draw your boundary to enable submission
          </Typography>
        )}
        {coordsReady && (
          <Typography
            variant="body2"
            sx={{ color: "success.main", fontWeight: 500 }}
          >
            Boundary received - ready to submit
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
