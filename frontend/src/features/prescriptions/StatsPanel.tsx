import { Box, Typography, Paper, Stack } from "@mui/material";
import { COLORS } from "../../styles/colors";
import React from "react";
import GridOnIcon from "@mui/icons-material/GridOn";
import type { StatsPanelProps } from "./types";

export const StatsPanel: React.FC<StatsPanelProps> = ({ cells }) => {
  const avgPayback =
    cells.length > 0
      ? (
          cells.reduce((sum, c) => sum + c.paybackPeriod, 0) / cells.length
        ).toFixed(1)
      : "0";

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
        <GridOnIcon fontSize="small" />
        Analysis Summary
      </Typography>

      <Stack spacing={1.5}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" sx={{ color: COLORS.whiteMedium }}>
            Total Grid Cells
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: COLORS.whiteHigh, fontWeight: 600 }}
          >
            {cells.length.toLocaleString()}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" sx={{ color: COLORS.whiteMedium }}>
            Avg. Payback Period
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: COLORS.whiteHigh, fontWeight: 600 }}
          >
            {avgPayback} years
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
