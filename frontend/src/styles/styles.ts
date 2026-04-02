import { COLORS } from "./colors";

export const dropzoneStyles = {
  base: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 16,
    borderColor: COLORS.whiteLow,
    backgroundColor: COLORS.bgCard,
    color: COLORS.whiteHigh,
    transition: "border-color 0.24s ease, background-color 0.24s ease",
    padding: "1.5rem",
    minHeight: 160,
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  active: {
    borderColor: COLORS.indigo,
    backgroundColor: COLORS.indigoLight,
  },
  reject: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight,
  },
};
