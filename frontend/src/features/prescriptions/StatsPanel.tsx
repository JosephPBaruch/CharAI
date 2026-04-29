import { Box, Typography, Paper, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import React from "react";
import GridOnIcon from "@mui/icons-material/GridOn";
import type { StatsPanelProps } from "./types";

export const StatsPanel: React.FC<StatsPanelProps> = ({ cells }) => {
  const theme = useTheme();
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
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary }}
          >
            Total Grid Cells
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.primary }}
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
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary }}
          >
            Avg. Payback Period
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.primary, fontWeight: 600 }}
          >
            {avgPayback} years
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
