import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Divider,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import React from "react";
import { InteractiveFarmMap } from "../map";
import { type LatLngLiteral } from "leaflet";
import { useCoordinates } from "../../contexts/CoordinateContext";
import type { FeatureCollection, Feature, Polygon } from "geojson";

export default function ManualCoordinateUpload() {
  const { data, setCoordinateData } = useCoordinates();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [markers, setMarkers] = React.useState<LatLngLiteral[]>([]);

  // On mount or when modal opens with existing data, load markers from context
  // Check pendingData first, fall back to data (committed coords)
  React.useEffect(() => {
    if (isModalOpen) {
      const coordSource = data;
      if (coordSource) {
        const boundaryFeature = coordSource.features.find(
          (f) => f.geometry.type === "Polygon",
        ) as Feature<Polygon> | undefined;
        if (boundaryFeature?.geometry.type === "Polygon") {
          const coords = boundaryFeature.geometry.coordinates[0];
          // Remove last coord (which closes the polygon)
          const polygonMarkers: LatLngLiteral[] = coords
            .slice(0, -1)
            .map(([lng, lat]) => ({
              lat,
              lng,
            }));
          setMarkers(polygonMarkers);
        }
      }
    }
  }, [isModalOpen, data]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleClearMarkers = () => {
    setMarkers([]);
  };

  const handleUndoMarker = () => {
    if (markers.length > 0) {
      setMarkers((prev) => prev.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    if (markers.length < 3) return;

    // Convert markers to GeoJSON boundary polygon
    const coords: [number, number][] = markers.map((m) => [m.lng, m.lat]);
    // Close the polygon by adding the first point at the end
    coords.push(coords[0]);

    const boundary: Feature<Polygon> = {
      type: "Feature",
      properties: { type: "boundary", applicationRate: 5, paybackPeriod: 3 },
      geometry: {
        type: "Polygon",
        coordinates: [coords],
      },
    };

    const geojson: FeatureCollection = {
      type: "FeatureCollection",
      features: [boundary],
    };

    // Save to context (which persists to localStorage)
    setCoordinateData(geojson);

    closeModal();
  };

  // Check if coordinates have already been submitted or are pending
  const hasCoordinatesReady = data && data.features.length > 0;

  return (
    <>
      <Button
        variant="contained"
        startIcon={hasCoordinatesReady ? <EditIcon /> : undefined}
        onClick={openModal}
        fullWidth
        data-testid="open-manual-coordinates"
        sx={{
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.95rem",
        }}
      >
        {hasCoordinatesReady ? "Manually edit coordinates" : "Draw boundaries"}
      </Button>

      <Dialog open={isModalOpen} onClose={closeModal} maxWidth="xl" fullWidth>
        <DialogTitle sx={{ pb: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <IconButton
              onClick={closeModal}
              sx={{
                gap: 1,
                color: "text.primary",
                "&:hover": {
                  backgroundColor: isDark
                    ? alpha(theme.palette.common.white, 0.08)
                    : alpha(theme.palette.common.black, 0.04),
                },
              }}
            >
              <ArrowBackIcon />
              <Typography sx={{ fontSize: "0.95rem" }}>Back</Typography>
            </IconButton>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, color: "text.primary" }}
              data-testid="modal-title"
            >
              Define Field Boundaries
            </Typography>
            <Box sx={{ width: 80 }} /> {/* Spacer for centering */}
          </Box>
        </DialogTitle>

        <Divider sx={{ borderColor: "divider" }} />

        <DialogContent
          sx={{ pt: 2, pb: 2, px: 4, height: "calc(100vh - 100px)" }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              height: "100%",
              minHeight: 0,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            {/* Map Section - Takes most of the space */}
            <Box
              sx={{
                flex: 1,
                borderRadius: 2,
                minWidth: 0,
                minHeight: { xs: 300, md: 0 },
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: `0 4px 12px ${
                  isDark
                    ? alpha(theme.palette.common.black, 0.5)
                    : alpha(theme.palette.common.black, 0.1)
                }`,
              }}
            >
              <InteractiveFarmMap
                markers={markers}
                setMarkers={setMarkers}
                data-testid="interactive-farm-map"
              />
            </Box>

            {/* Sidebar - Instructions and Controls */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                flexShrink: 0,
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              {/* Instructions Section */}
              <Paper
                elevation={0}
                sx={{
                  backgroundColor: isDark
                    ? alpha(theme.palette.primary.main, 0.1)
                    : alpha(theme.palette.primary.main, 0.06),
                  border: `1px solid ${
                    isDark
                      ? alpha(theme.palette.primary.main, 0.3)
                      : alpha(theme.palette.primary.main, 0.4)
                  }`,
                  borderRadius: 2,
                  p: 2,
                  flexShrink: 0,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    color: "primary.main",
                    fontSize: "1rem",
                  }}
                >
                  How to use:
                </Typography>
                <Stack spacing={0.5}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.6,
                      fontSize: "0.85rem",
                    }}
                  >
                    • <strong>Click on the map</strong> to place boundary
                    markers for your field
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.6,
                      fontSize: "0.85rem",
                    }}
                  >
                    • <strong>Drag markers</strong> to adjust their position
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.6,
                      fontSize: "0.85rem",
                    }}
                  >
                    • <strong>Place at least 3 markers</strong> to define a
                    field boundary (polygon will appear automatically)
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.6,
                      fontSize: "0.85rem",
                    }}
                  >
                    • Use <strong>Undo</strong> to remove the last marker or{" "}
                    <strong>Clear All</strong> to start over
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.6,
                      fontSize: "0.85rem",
                    }}
                  >
                    • Click <strong>Submit</strong> when you're satisfied with
                    your field boundaries
                  </Typography>
                </Stack>
              </Paper>

              {/* Coordinate text fields for manual editing */}
              <Paper
                elevation={0}
                data-testid="coordinates-panel"
                sx={{
                  backgroundColor: "background.paper",
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  p: 2,
                  maxHeight: { xs: 300, md: "none" },
                  minHeight: 0,
                  overflowY: "auto",
                  flex: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: "1rem",
                      color: "text.primary",
                    }}
                  >
                    Coordinates
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    data-testid="add-marker-button"
                    onClick={() =>
                      setMarkers((prev) => [...prev, { lat: 0, lng: 0 }])
                    }
                    sx={{
                      borderColor: "primary.main",
                      color: "primary.main",
                      "&:hover": {
                        borderColor: "primary.light",
                        backgroundColor: isDark
                          ? alpha(theme.palette.primary.main, 0.1)
                          : alpha(theme.palette.primary.main, 0.06),
                      },
                    }}
                  >
                    Add Marker
                  </Button>
                </Box>
                {markers.length === 0 && (
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", fontSize: "0.85rem" }}
                  >
                    Click the map or press "Add Marker" to begin.
                  </Typography>
                )}
                <Stack spacing={1.5}>
                  {markers.map((mark, idx) => (
                    <Box
                      key={idx}
                      data-testid={`marker-row-${idx}`}
                      sx={{ display: "flex", gap: 1, alignItems: "center" }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", minWidth: 24 }}
                      >
                        {idx + 1}.
                      </Typography>
                      <TextField
                        label="Lat"
                        size="small"
                        type="number"
                        value={mark.lat}
                        inputProps={{ step: 0.001 }}
                        data-testid={`marker-lat-${idx}`}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            setMarkers((prev) =>
                              prev.map((m, i) =>
                                i === idx ? { ...m, lat: val } : m,
                              ),
                            );
                          }
                        }}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        label="Lng"
                        size="small"
                        type="number"
                        value={mark.lng}
                        inputProps={{ step: 0.001 }}
                        data-testid={`marker-lng-${idx}`}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            setMarkers((prev) =>
                              prev.map((m, i) =>
                                i === idx ? { ...m, lng: val } : m,
                              ),
                            );
                          }
                        }}
                        sx={{ flex: 1 }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Paper>

              {/* Action Buttons */}
              <Stack spacing={1.5} sx={{ flexShrink: 0 }}>
                {/* Undo and Clear buttons in a row */}
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button
                    variant="outlined"
                    onClick={handleUndoMarker}
                    disabled={markers.length === 0}
                    fullWidth
                    data-testid="undo-marker-button"
                    sx={{
                      borderColor: "warning.main",
                      color: "warning.main",
                      "&:hover": {
                        borderColor: "warning.main",
                        backgroundColor: isDark
                          ? alpha(theme.palette.warning.main, 0.08)
                          : alpha(theme.palette.warning.main, 0.06),
                      },
                      "&:disabled": {
                        borderColor: "action.disabled",
                        color: "action.disabled",
                      },
                    }}
                  >
                    Undo
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={handleClearMarkers}
                    disabled={markers.length === 0}
                    fullWidth
                    data-testid="clear-markers-button"
                    sx={{
                      borderColor: "error.main",
                      color: "error.main",
                      "&:hover": {
                        borderColor: "error.main",
                        backgroundColor: isDark
                          ? alpha(theme.palette.error.main, 0.08)
                          : alpha(theme.palette.error.main, 0.06),
                      },
                      "&:disabled": {
                        borderColor: "action.disabled",
                        color: "action.disabled",
                      },
                    }}
                  >
                    Clear All
                  </Button>
                </Box>

                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={markers.length < 3}
                  fullWidth
                  data-testid="save-boundaries-button"
                  sx={{
                    py: 1.2,
                  }}
                >
                  Save Boundaries
                </Button>
              </Stack>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
