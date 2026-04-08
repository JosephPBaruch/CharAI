import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DescriptionIcon from "@mui/icons-material/Description";
import MapIcon from "@mui/icons-material/Map";
import type { FileTypes, FileTypeSeparationScreenProps } from "./types";
import { getStepContentStyles } from "../../../styles/theme";

interface FileTypeOption {
  type: FileTypes;
  title: string;
  description: string;
  formats: string[];
  icon: React.ReactNode;
}

const fileTypeOptions: FileTypeOption[] = [
  {
    type: "text",
    title: "CSV or JSON",
    description: "Spreadsheet or data interchange format",
    formats: [".csv", ".json"],
    icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
  },
  {
    type: "visual",
    title: "GeoJSON, KML, or Shapefile",
    description: "Geographic data formats",
    formats: [".geojson", ".kml", ".shp"],
    icon: <MapIcon sx={{ fontSize: 40 }} />,
  },
];

export default function FileTypeSeparationScreen({
  setFileType,
  fileType,
}: FileTypeSeparationScreenProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const stepContentStyles = getStepContentStyles(isDark);

  return (
    <Box sx={stepContentStyles.container}>
      {/* Header Section */}
      <Box sx={stepContentStyles.section}>
        <Typography
          variant="h5"
          sx={{
            color: "text.primary",
            fontWeight: 600,
          }}
        >
          Which file format are you using?
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            lineHeight: 1.6,
          }}
        >
          Choose the format that matches your farm boundary file. Don't worry—CharAI
          supports multiple formats and can handle them correctly.
        </Typography>
      </Box>

      {/* File Type Options Grid */}
      <Grid container spacing={2}>
        {fileTypeOptions.map((option) => (
          <Grid item xs={12} sm={6} key={option.type}>
            <Paper
              component={Button}
              onClick={() => setFileType(option.type)}
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                alignItems: "flex-start",
                border: `2px solid ${
                  fileType === option.type
                    ? "primary.main"
                    : isDark
                      ? "rgba(255,255,255,0.1)"
                      : "#e5e7eb"
                }`,
                background:
                  fileType === option.type
                    ? isDark
                      ? "rgba(100, 108, 255, 0.08)"
                      : "rgba(100, 108, 255, 0.03)"
                    : "transparent",
                transition: "all 0.2s ease",
                borderRadius: 2,
                textAlign: "left",
                cursor: "pointer",
                textTransform: "none",
                color: "inherit",
                "&:hover": {
                  borderColor:
                    fileType === option.type ? "primary.main" : "primary.light",
                  background:
                    fileType === option.type
                      ? isDark
                        ? "rgba(100, 108, 255, 0.12)"
                        : "rgba(100, 108, 255, 0.05)"
                      : isDark
                        ? "rgba(100, 108, 255, 0.05)"
                        : "rgba(100, 108, 255, 0.02)",
                },
              }}
            >
              {/* Icon */}
              <Box sx={{ color: "primary.main" }}>{option.icon}</Box>

              {/* Title and Description */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                  }}
                >
                  {option.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  {option.description}
                </Typography>
              </Box>

              {/* Supported Formats */}
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                  mt: "auto",
                }}
              >
                {option.formats.map((format) => (
                  <Typography
                    key={format}
                    variant="caption"
                    sx={{
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.04)",
                      color: "text.secondary",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                    }}
                  >
                    {format}
                  </Typography>
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
