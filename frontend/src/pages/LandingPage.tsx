import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";

const LandingPage = () => {
  const [count, setCount] = useState(0);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%", // fills #root
        textAlign: "center",
        gap: 3, // spacing between elements
        px: 2, // optional horizontal padding for small screens
      }}
    >
      <Typography variant="h3" component="h1">
        CharAI
      </Typography>

      <Typography variant="body1">
        Frontend initialized with React, TypeScript, Vite, and Material UI
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setCount((c) => c + 1)}
      >
        Count: {count}
      </Button>
    </Box>
  );
}

export default LandingPage;