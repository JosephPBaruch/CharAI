import { createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";
import { COLORS } from "./colors";

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: COLORS.indigo,
        light: COLORS.indigoHover,
        dark: "#4a51cc",
      },
      error: {
        main: COLORS.error,
      },
      warning: {
        main: COLORS.warning,
      },
      background: {
        default: isDark ? COLORS.bgPage : "#f5f5f7",
        paper: isDark ? COLORS.bgCard : "#ffffff",
      },
      text: {
        primary: isDark ? COLORS.whiteHigh : "#1a1a2e",
        secondary: isDark ? COLORS.whiteMedium : "#64748b",
      },
    },
    typography: {
      fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: "none" },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
            fontSize: "0.9rem",
          },
          contained: {
            backgroundColor: COLORS.indigo,
            color: "#fff",
            "&:hover": {
              backgroundColor: COLORS.indigoHover,
            },
          },
          outlined: {
            borderColor: isDark ? COLORS.whiteLow : "#d1d5db",
            color: isDark ? COLORS.whiteHigh : "#1a1a2e",
            "&:hover": {
              borderColor: isDark ? COLORS.whiteMedium : "#9ca3af",
              backgroundColor: isDark ? COLORS.whiteHover : "rgba(0,0,0,0.04)",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${isDark ? COLORS.whiteVeryLow : "#e5e7eb"}`,
          },
          head: {
            fontWeight: 600,
            color: isDark ? COLORS.whiteMedium : "#64748b",
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": {
              backgroundColor: isDark ? COLORS.whiteHover : "rgba(0,0,0,0.02)",
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: isDark
              ? `linear-gradient(180deg, #0a0a0a 0%, ${COLORS.bgCard} 100%)`
              : `linear-gradient(180deg, #f0f0f5 0%, #ffffff 100%)`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? COLORS.bgDark : "#ffffff",
            backgroundImage: "none",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            fontSize: "0.75rem",
          },
        },
      },
    },
  });
}
