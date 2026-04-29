import { Box, Typography, Paper, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import React from "react";

export const PaybackLegend: React.FC = () => {
  const theme = useTheme();
  const legendItems = [
    {
      range: "1-2 years",
      color: theme.palette.custom.dataGreen,
      label: "Very High Priority",
    },
    {
      range: "3-4 years",
      color: theme.palette.custom.dataLightGreen,
      label: "High Priority",
    },
    {
      range: "5-6 years",
      color: theme.palette.custom.dataYellow,
      label: "Medium Priority",
    },
    {
      range: "7-8 years",
      color: theme.palette.custom.dataOrange,
      label: "Low Priority",
    },
    {
      range: "9-10 years",
      color: theme.palette.custom.dataRed,
      label: "Very Low Priority",
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: alpha(theme.palette.background.paper, 0.7),
        backdropFilter: "blur(8px)",
        border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
        borderRadius: 2,
        p: 2,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          color: theme.palette.text.primary,
          fontWeight: 600,
          mb: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        Payback Period Legend
      </Typography>
      <Stack spacing={0.75}>
        {legendItems.map((item) => (
          <Box
            key={item.range}
            sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
          >
            <Box
              sx={{
                width: 20,
                height: 14,
                backgroundColor: item.color,
                borderRadius: 0.5,
                border: `1px solid ${alpha(theme.palette.common.black, 0.3)}`,
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.secondary, flex: 1 }}
            >
              {item.range}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: theme.palette.text.primary, fontWeight: 500 }}
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};
