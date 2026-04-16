import type { Theme } from "@mui/material/styles";

// Returns the standard page gradient background for the current theme mode.
// Used consistently across page-level components.
export function getPageGradientBg(theme: Theme): string {
  return theme.palette.mode === "dark"
    ? `linear-gradient(180deg, #0a0a0a 0%, ${theme.palette.background.default} 100%)`
    : `linear-gradient(180deg, #f0f0f5 0%, ${theme.palette.background.default} 100%)`;
}
