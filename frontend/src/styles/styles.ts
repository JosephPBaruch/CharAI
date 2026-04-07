import { getDropzoneStyles } from "./theme";

/**
 * Convenience export for getDropzoneStyles from theme.ts
 * Use this in components by calling: getDropzoneStyles(theme.palette.mode === "dark")
 * 
 * @deprecated Use getDropzoneStyles from theme.ts directly
 */
export const dropzoneStyles = {
  // Kept for backward compatibility - dark mode default
  base: getDropzoneStyles(true).base,
  active: getDropzoneStyles(true).active,
  reject: getDropzoneStyles(true).reject,
};

export { getDropzoneStyles } from "./theme";

