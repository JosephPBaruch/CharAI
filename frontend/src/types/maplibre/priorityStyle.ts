import { COLORS } from "../../styles/colors";

// MapLibre GL paint expression for fill-color.
// Primary: derive color by numeric ROI metric `paybackPeriod` (e.g., months).
//   - Quickest payback -> red (urgent)
//   - Slowest payback -> green (fine)
// Fallback: if `paybackPeriod` missing, use categorical priority/priorityRange mapping.
export const priorityFillColorExpression = [
  "case",
  ["has", "paybackPeriod"],
  // step(paybackPeriod, baseColor, stop1, color1, stop2, color2, ...)
  [
    "step",
    ["get", "paybackPeriod"],
    COLORS.dataRed,
    6,
    COLORS.dataOrange,
    12,
    COLORS.dataYellow,
    18,
    COLORS.dataLightGreen,
    24,
    COLORS.dataGreen,
  ],
  // Fallback to categorical priority mapping
  [
    "match",
    [
      "downcase",
      [
        "coalesce",
        ["to-string", ["get", "priority"]],
        ["to-string", ["get", "priorityRange"]],
        "",
      ],
    ],
    "high",
    COLORS.dataRed,
    "medium-high",
    COLORS.dataOrange,
    "medium",
    COLORS.dataYellow,
    "medium-low",
    COLORS.dataLightGreen,
    "low",
    COLORS.dataGreen,
    COLORS.dataDefault,
  ],
];
