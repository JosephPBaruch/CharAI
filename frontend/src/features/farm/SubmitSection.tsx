import { Button, Typography, Stack } from "@mui/material";

interface SubmitSectionProps {
  coordsReady: boolean;
  onSubmit: () => void;
}

export default function SubmitSection({
  coordsReady,
  onSubmit,
}: SubmitSectionProps) {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{ width: "100%", justifyContent: "space-between" }}
    >
      {!coordsReady ? (
        <Typography
          variant="body2"
          sx={{ color: "error.main", fontWeight: 500 }}
        >
          *required
        </Typography>
      ) : (
        <span />
      )}
      <Button
        variant="contained"
        size="large"
        disabled={!coordsReady}
        onClick={onSubmit}
        sx={{ px: 4 }}
      >
        Submit request
      </Button>
    </Stack>
  );
}
