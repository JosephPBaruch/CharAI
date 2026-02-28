import { Box, CircularProgress } from "@mui/material";

export default function LoadingProgress() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      width="100%"
      flexDirection="column"
    >
      <CircularProgress size={50} />
      {/* Notes on waiting strategy:
        - should be indeterminate for now, because we don't have anything to report on.
        - however, we should still show progress, or show the steps that are happening. the only issue is how do we time these messages?
        - wait time can be anywhere from one to four minutes, mostly depending on the size of the farm. so when do we rotate through messages?
      */}
    </Box>
  );
}
