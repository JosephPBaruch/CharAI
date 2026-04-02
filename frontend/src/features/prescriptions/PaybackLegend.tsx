import { Box, Typography, Paper, Stack } from "@mui/material";
import { COLORS } from "../../styles/colors";
import React from "react";

export const PaybackLegend: React.FC = () => {
  const legendItems = [
    {
      range: "1-2 years",
      color: COLORS.dataGreen,
      label: "Very High Priority",
    },
    {
      range: "3-4 years",
      color: COLORS.dataLightGreen,
      label: "High Priority",
    },
    { range: "5-6 years", color: COLORS.dataYellow, label: "Medium Priority" },
    { range: "7-8 years", color: COLORS.dataOrange, label: "Low Priority" },
    {
      range: "9-10 years",
      color: COLORS.dataRed,
      label: "Very Low Priority",
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: COLORS.blackOverlay,
        backdropFilter: "blur(8px)",
        border: `1px solid ${COLORS.whiteVeryLow}`,
        borderRadius: 2,
        p: 2,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          color: COLORS.whiteHigh,
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
                border: `1px solid ${COLORS.blackLow}`,
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: COLORS.whiteMedium, flex: 1 }}
            >
              {item.range}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: COLORS.whiteHigh, fontWeight: 500 }}
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};
