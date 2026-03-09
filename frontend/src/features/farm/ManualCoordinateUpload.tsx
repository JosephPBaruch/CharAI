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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { COLORS } from "../../styles/colors";
import React from "react";
import { InteractiveFarmMap } from "../map";
import { type LatLngLiteral } from "leaflet";
import { useCoordinates } from "../../contexts/CoordinateContext";
import type { FeatureCollection, Feature, Polygon } from "geojson";

export default function ManualCoordinateUpload() {
  const { data, setCoordinateData } = useCoordinates();
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

    console.log("Submitted coordinates:", markers);
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
        data-testid="open-manual-coordinates"
        sx={{
          backgroundColor: COLORS.indigo,
          "&:hover": { backgroundColor: COLORS.indigoHover },
          textTransform: "none",
          fontSize: "0.95rem",
        }}
      >
        {hasCoordinatesReady ? "Edit Coordinates" : "Draw Boundaries"}
      </Button>

      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: COLORS.bgDark,
            backgroundImage: "none",
            color: COLORS.whiteHigh,
            height: "92vh",
            maxHeight: "92vh",
            borderRadius: 2,
          },
        }}
      >
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
                color: COLORS.whiteHigh,
                gap: 1,
                "&:hover": { backgroundColor: COLORS.whiteHover },
              }}
            >
              <ArrowBackIcon />
              <Typography sx={{ fontSize: "0.95rem" }}>Back</Typography>
            </IconButton>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600 }}
              data-testid="modal-title"
            >
              Define Field Boundaries
            </Typography>
            <Box sx={{ width: 80 }} /> {/* Spacer for centering */}
          </Box>
        </DialogTitle>

        <Divider sx={{ borderColor: COLORS.whiteVeryLow }} />

        <DialogContent sx={{ pt: 2, pb: 2, px: 4, overflow: "hidden" }}>
          <Box sx={{ display: "flex", gap: 2, height: "100%" }}>
            {/* Map Section - Takes most of the space */}
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                borderRadius: 2,
                overflow: "hidden",
                border: `1px solid ${COLORS.whiteVeryLow}`,
                boxShadow: `0 4px 12px ${COLORS.blackMedium}`,
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
                width: "380px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                flexShrink: 0,
              }}
            >
              {/* Instructions Section */}
              <Paper
                elevation={0}
                sx={{
                  backgroundColor: COLORS.indigoLight,
                  border: `1px solid ${COLORS.indigoBorder}`,
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
                    color: COLORS.indigo,
                    fontSize: "1rem",
                  }}
                >
                  How to use:
                </Typography>
                <Stack spacing={0.5}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: COLORS.whiteMedium,
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
                      color: COLORS.whiteMedium,
                      lineHeight: 1.6,
                      fontSize: "0.85rem",
                    }}
                  >
                    • <strong>Drag markers</strong> to adjust their position
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: COLORS.whiteMedium,
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
                      color: COLORS.whiteMedium,
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
                      color: COLORS.whiteMedium,
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
                  backgroundColor: COLORS.bgDark,
                  border: `1px solid ${COLORS.whiteVeryLow}`,
                  borderRadius: 2,
                  p: 2,
                  maxHeight: "300px",
                  overflowY: "auto",
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
                      color: COLORS.whiteHigh,
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
                      borderColor: COLORS.indigo,
                      color: COLORS.indigo,
                      textTransform: "none",
                      fontSize: "0.8rem",
                      "&:hover": {
                        borderColor: COLORS.indigoHover,
                        backgroundColor: COLORS.indigoLight,
                      },
                    }}
                  >
                    Add Marker
                  </Button>
                </Box>
                {markers.length === 0 && (
                  <Typography
                    variant="body2"
                    sx={{ color: COLORS.whiteMedium, fontSize: "0.85rem" }}
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
                        sx={{ color: COLORS.whiteMedium, minWidth: 24 }}
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
                        sx={{
                          flex: 1,
                          "& .MuiInputBase-input": {
                            color: COLORS.whiteHigh,
                            fontSize: "0.85rem",
                          },
                          "& .MuiInputLabel-root": {
                            color: COLORS.whiteMedium,
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: COLORS.whiteVeryLow,
                          },
                        }}
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
                        sx={{
                          flex: 1,
                          "& .MuiInputBase-input": {
                            color: COLORS.whiteHigh,
                            fontSize: "0.85rem",
                          },
                          "& .MuiInputLabel-root": {
                            color: COLORS.whiteMedium,
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: COLORS.whiteVeryLow,
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Paper>

              {/* Spacer to push buttons to bottom */}
              <Box sx={{ flex: 1 }} />

              {/* Action Buttons */}
              <Stack spacing={1.5}>
                {/* Undo and Clear buttons in a row */}
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Button
                    variant="outlined"
                    onClick={handleUndoMarker}
                    disabled={markers.length === 0}
                    fullWidth
                    data-testid="undo-marker-button"
                    sx={{
                      borderColor: COLORS.warningBorder,
                      color: COLORS.warning,
                      textTransform: "none",
                      py: 1.2,
                      "&:hover": {
                        borderColor: COLORS.warning,
                        backgroundColor: COLORS.warningLight,
                      },
                      "&:disabled": {
                        borderColor: COLORS.whiteVeryLow,
                        color: COLORS.whiteDisabled,
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
                      borderColor: COLORS.errorBorder,
                      color: COLORS.error,
                      textTransform: "none",
                      py: 1.2,
                      "&:hover": {
                        borderColor: COLORS.error,
                        backgroundColor: COLORS.errorLight,
                      },
                      "&:disabled": {
                        borderColor: COLORS.whiteVeryLow,
                        color: COLORS.whiteDisabled,
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
                    backgroundColor: COLORS.indigo,
                    textTransform: "none",
                    py: 1.2,
                    "&:hover": {
                      backgroundColor: COLORS.indigoHover,
                    },
                    "&:disabled": {
                      backgroundColor: COLORS.whiteVeryLow,
                      color: COLORS.whiteDisabled,
                    },
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
