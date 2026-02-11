export const COLORS = {
  // whites
  whiteFull: "rgba(255, 255, 255, 1)",
  whiteHigh: "rgba(255, 255, 255, 0.87)", // for primary text
  whiteMedium: "rgba(255, 255, 255, 0.5)", // for placeholders or secondary text
  whiteLow: "rgba(255, 255, 255, 0.23)", // for borders or subtle accents
  whiteVeryLow: "rgba(255, 255, 255, 0.12)", // for subtle dividers
  whiteHover: "rgba(255, 255, 255, 0.08)", // for hover states on dark bg
  whiteDisabled: "rgba(255, 255, 255, 0.3)", // for disabled text

  // blacks
  blackFull: "#000000",
  blackHigh: "rgba(0, 0, 0, 0.85)", // for dark overlays
  blackMedium: "rgba(0, 0, 0, 0.5)", // for shadows or overlays
  blackLow: "rgba(0, 0, 0, 0.3)", // for subtle shadows
  blackOverlay: "rgba(0, 0, 0, 0.7)", // for modal overlays

  // grays / backgrounds
  bgDark: "#0a0a0a", // very dark background
  bgCard: "#1a1a1a", // card background
  bgPage: "#242424", // page background
  textDark: "#111", // dark text on light backgrounds
  strokeDark: "#222", // dark stroke for grid cells

  // primary accent - indigo
  indigo: "#646cff", // primary accent for links/buttons
  indigoHover: "#7a81ff", // hover state for indigo
  indigoLight: "rgba(100, 108, 255, 0.1)", // light indigo background
  indigoMedium: "rgba(100, 108, 255, 0.15)", // medium indigo background
  indigoVeryLight: "rgba(100, 108, 255, 0.05)", // very light indigo background
  indigoBorder: "rgba(99, 102, 241, 0.3)", // indigo border
  indigoText: "#a5b4fc", // light indigo for text

  // error / danger - red
  error: "#ef4444",
  errorHover: "#c62828",
  errorBg: "#d32f2f",
  errorLight: "rgba(239, 68, 68, 0.1)",
  errorBorder: "rgba(239, 68, 68, 0.4)",

  // warning - amber/yellow
  warning: "#fbbf24",
  warningBorder: "rgba(251, 191, 36, 0.5)",
  warningLight: "rgba(251, 191, 36, 0.1)",

  // accent - gold (for map highlights)
  gold: "#FFD700",

  // data visualization - payback period scale
  dataGreen: "#1a9641", // excellent (1-2 years)
  dataLightGreen: "#a6d96a", // good (3-4 years)
  dataYellow: "#f9d423", // moderate (5-6 years)
  dataOrange: "#f58634", // fair (7-8 years)
  dataRed: "#d7191c", // poor (9-10 years)
  dataDefault: "#90caf9", // fallback/default
};
