import { createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";
import { COLORS } from "./colors";

/**
 * Helper function to generate dropzone styles based on theme
 */
export function getDropzoneStyles(isDark: boolean) {
  return {
    base: {
      borderWidth: 2,
      borderStyle: "dashed" as const,
      borderRadius: 16,
      borderColor: isDark ? COLORS.whiteLow : "#d1d5db",
      backgroundColor: isDark ? COLORS.bgCard : "#f9fafb",
      color: isDark ? COLORS.whiteHigh : "#1a1a2e",
      transition: "border-color 0.24s ease, background-color 0.24s ease",
      padding: "1.5rem",
      minHeight: 160,
      display: "flex" as const,
      flexDirection: "column" as const,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      cursor: "pointer" as const,
    },
    active: {
      borderColor: COLORS.indigo,
      backgroundColor: isDark ? COLORS.indigoLight : "rgba(100, 108, 255, 0.05)",
    },
    reject: {
      borderColor: COLORS.error,
      backgroundColor: isDark ? COLORS.errorLight : "rgba(239, 68, 68, 0.08)",
    },
  };
}

/**
 * Helper function to generate step content container styles
 * Used in stepper-based modal flows
 */
export function getStepContentStyles(isDark: boolean) {
  return {
    container: {
      display: "flex" as const,
      flexDirection: "column" as const,
      gap: 3,
      py: 3,
      px: 0,
    },
    section: {
      display: "flex" as const,
      flexDirection: "column" as const,
      gap: 2,
    },
  };
}

/**
 * Helper function to generate modal footer navigation styles
 */
export function getModalFooterStyles() {
  return {
    container: {
      display: "flex" as const,
      justifyContent: "flex-end" as const,
      gap: 2,
      pt: 3,
      mt: 2,
      borderTop: `1px solid ${isDark ? COLORS.whiteVeryLow : "#e5e7eb"}`,
    },
  };
}

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === "dark";
  const dropzoneStyles = getDropzoneStyles(isDark);

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
      divider: isDark ? COLORS.whiteVeryLow : "#e5e7eb",
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
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiInputBase-input": {
              color: isDark ? COLORS.whiteHigh : "#1a1a2e",
              fontSize: "0.9rem",
            },
            "& .MuiInputLabel-root": {
              color: isDark ? COLORS.whiteMedium : "#64748b",
              "&.Mui-focused": {
                color: COLORS.indigo,
              },
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? COLORS.whiteVeryLow : "#d1d5db",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? COLORS.whiteLow : "#9ca3af",
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: COLORS.indigo,
            },
          },
        },
      },
      MuiStepper: {
        styleOverrides: {
          root: {
            backgroundColor: "transparent",
          },
        },
      },
      MuiStepLabel: {
        styleOverrides: {
          label: {
            color: isDark ? COLORS.whiteMedium : "#64748b",
            "&.Mui-active": {
              color: isDark ? COLORS.whiteHigh : "#1a1a2e",
              fontWeight: 600,
            },
            "&.Mui-completed": {
              color: isDark ? COLORS.whiteMedium : "#64748b",
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
          standardError: {
            backgroundColor: isDark ? `${COLORS.error}20` : "rgba(239, 68, 68, 0.08)",
            color: COLORS.error,
            border: `1px solid ${COLORS.error}`,
            "& .MuiAlert-icon": {
              color: COLORS.error,
            },
          },
          standardWarning: {
            backgroundColor: isDark ? `${COLORS.warning}20` : "rgba(251, 191, 36, 0.08)",
            color: COLORS.warning,
            border: `1px solid ${COLORS.warning}`,
            "& .MuiAlert-icon": {
              color: COLORS.warning,
            },
          },
          standardInfo: {
            backgroundColor: isDark ? "rgba(100, 108, 255, 0.1)" : "rgba(100, 108, 255, 0.05)",
            color: COLORS.indigo,
            border: `1px solid ${COLORS.indigoBorder}`,
            "& .MuiAlert-icon": {
              color: COLORS.indigo,
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
            boxShadow: isDark
              ? "0 20px 60px rgba(0, 0, 0, 0.5)"
              : "0 20px 60px rgba(0, 0, 0, 0.1)",
          },
        },
      },
      MuiModal: {
        styleOverrides: {
          backdrop: {
            backgroundColor: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            color: isDark ? COLORS.whiteHigh : "#1a1a2e",
            fontWeight: 700,
            fontSize: "1.5rem",
            paddingBottom: "1rem",
            borderBottom: `1px solid ${isDark ? COLORS.whiteVeryLow : "#e5e7eb"}`,
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            color: isDark ? COLORS.whiteMedium : "#64748b",
            paddingTop: "1.5rem",
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: "1.5rem 0 0 0",
            gap: 1,
            borderTop: `1px solid ${isDark ? COLORS.whiteVeryLow : "#e5e7eb"}`,
            paddingTop: "1.5rem",
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
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: isDark ? COLORS.whiteMedium : "#64748b",
            "&:hover": {
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
            },
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
