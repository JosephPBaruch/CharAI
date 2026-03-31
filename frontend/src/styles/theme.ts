import { createTheme } from "@mui/material/styles";
import { COLORS } from "./colors";

const theme = createTheme({
  palette: {
    mode: "dark",
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
      default: COLORS.bgPage,
      paper: COLORS.bgCard,
    },
    text: {
      primary: COLORS.whiteHigh,
      secondary: COLORS.whiteMedium,
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
          "&:hover": {
            backgroundColor: COLORS.indigoHover,
          },
        },
        outlined: {
          borderColor: COLORS.whiteLow,
          color: COLORS.whiteHigh,
          "&:hover": {
            borderColor: COLORS.whiteMedium,
            backgroundColor: COLORS.whiteHover,
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
          borderBottom: `1px solid ${COLORS.whiteVeryLow}`,
        },
        head: {
          fontWeight: 600,
          color: COLORS.whiteMedium,
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
            backgroundColor: COLORS.whiteHover,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: COLORS.bgCard,
          backgroundImage: "none",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.bgDark,
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

export default theme;
