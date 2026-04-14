import { Box, Button, Typography } from "@mui/material";
import { COLORS } from "../../styles/colors";
import React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { GETFields, GETPrescriptionMap } from "../../api/fetch";
import LoadingProgress from "../../components/LoadingProgress";
import type { GeoJSONFeatureCollection, GridCell } from "./types";
import { getBoundaryLatLngs, getGridCellLatLngs } from "./helpers";
import { StatsPanel } from "./StatsPanel";
import { PaybackLegend } from "./PaybackLegend";
import { GridCanvasLayer } from "./GridCanvasLayer";
import EmptyPrescriptionState from "./EmptyPrescriptionData";

export default function PrescriptionMapViewer() {
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  const gridLayerRef = React.useRef<GridCanvasLayer | null>(null);
  const boundaryLayerRef = React.useRef<L.Polygon | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);

  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [prescriptionData, setPrescriptionData] =
    React.useState<GeoJSONFeatureCollection | null>(null);
  const [cells, setCells] = React.useState<GridCell[]>([]);
  const [fieldId, setFieldId] = React.useState<string>("");

  // Fetch backend data
  React.useEffect(() => {
    GETFields().then((fields) => {
      console.log("Fields from backend:", fields);

      const fieldId = fields["fields"][0]["field_id"].toString();
      if (!fieldId) {
        setIsLoading(false);
        return;
      }
      setFieldId(fieldId);

      GETPrescriptionMap(fieldId)
        .then((data) => {
          console.log("Prescription map data from backend:", data);

          const geojson = data.prescription_map as GeoJSONFeatureCollection;
          setPrescriptionData(geojson);

          const cells = getGridCellLatLngs(geojson);
          setCells(cells);
        })
        .catch(() => setPrescriptionData(null))
        .finally(() => setIsLoading(false));
    });
  }, [isLoading]);

  // Initialize grid layer
  React.useEffect(() => {
    if (!mapRef.current || cells.length === 0) return;

    if (!gridLayerRef.current) {
      gridLayerRef.current = new GridCanvasLayer(cells, (cell, e) => {
        if (!tooltipRef.current) return;

        if (!cell) {
          tooltipRef.current.style.display = "none";
          return;
        }

        tooltipRef.current.style.display = "block";
        tooltipRef.current.style.left = `${e.pageX + 12}px`;
        tooltipRef.current.style.top = `${e.pageY + 12}px`;

        const center = cell.bounds.getCenter();

        tooltipRef.current.innerHTML = `
          <div><strong>Payback:</strong> ${cell.paybackPeriod} years</div>
          <div><strong>Lat:</strong> ${center.lat.toFixed(5)}</div>
          <div><strong>Lng:</strong> ${center.lng.toFixed(5)}</div>
        `;
      });

      gridLayerRef.current.addTo(mapRef.current);
    } else {
      gridLayerRef.current.setCells(cells);
    }
  }, [cells]);

  // Initialize and add boundary layer
  React.useEffect(() => {
    if (!mapRef.current || !prescriptionData) return;

    const latLngs = getBoundaryLatLngs(prescriptionData);

    if (latLngs.length < 3) return;

    if (boundaryLayerRef.current) {
      mapRef.current.removeLayer(boundaryLayerRef.current);
    }

    boundaryLayerRef.current = L.polygon(latLngs, {
      color: "#00ffcc",
      weight: 2,
      fill: false,
    }).addTo(mapRef.current);

    mapRef.current.fitBounds(boundaryLayerRef.current.getBounds());
  }, [prescriptionData]);

  // Initialize map
  React.useEffect(() => {
    // Only initialize the map after loading is finished and the container exists
    if (isLoading) return;
    if (!mapContainerRef.current || mapRef.current) return;
    console.log("Map effect running", mapContainerRef.current);

    if (prescriptionData === null) return;
    console.log(`prescriptionData object: ${JSON.stringify(prescriptionData)}`);
    const boundaryLatLngs = new L.LatLngBounds(
      getBoundaryLatLngs(prescriptionData),
    );

    console.log(`boundaryLatLngs object: ${JSON.stringify(boundaryLatLngs)}`);
    const center = boundaryLatLngs.getCenter();

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: 14,
      zoomControl: false,
    });

    // Add zoom control to bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapRef.current = map;

    // Add ESRI satellite imagery
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles © Esri",
        maxZoom: 20,
      },
    ).addTo(map);

    // Add ESRI labels
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 20,
      },
    ).addTo(map);

    // Create tooltip element
    const tooltip = document.createElement("div");
    tooltip.style.cssText = `
      position: absolute;
      background: rgba(0,0,0,0.85);
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      color: #fff;
      pointer-events: none;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: none;
      border: 1px solid rgba(255,255,255,0.1);
    `;
    document.body.appendChild(tooltip);
    tooltipRef.current = tooltip;

    return () => {
      if (tooltipRef.current) {
        document.body.removeChild(tooltipRef.current);
        tooltipRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isLoading]);

  const handleExport = () => {
    if (!prescriptionData) return;
    const json = JSON.stringify(prescriptionData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prescription-map-${fieldId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Loading state
  if (isLoading) return <LoadingProgress />;

  // Empty state
  if (!prescriptionData) {
    return <EmptyPrescriptionState />;
  }

  return (
    <Box
      sx={{
        height: "calc(100vh - 100px)",
        display: "flex",
        flexDirection: "column",
        p: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          pb: 2,
          borderBottom: `1px solid ${COLORS.whiteVeryLow}`,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              color: COLORS.whiteHigh,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            Prescription Map
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: COLORS.whiteMedium, mt: 0.5 }}
          >
            Biochar application recommendations based on your field analysis
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<FileDownloadOutlinedIcon />}
          onClick={handleExport}
          data-testid="export-prescription-data"
          sx={{ color: COLORS.whiteHigh, borderColor: COLORS.whiteMedium }}
        >
          Export Data
        </Button>
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, display: "flex", gap: 2, minHeight: 0 }}>
        {/* Map container */}
        <Box
          sx={{
            flex: 1,
            position: "relative",
            borderRadius: 2,
            overflow: "hidden",
            border: `1px solid ${COLORS.whiteVeryLow}`,
            boxShadow: `0 4px 20px ${COLORS.blackLow}`,
          }}
        >
          <div
            ref={mapContainerRef}
            style={{ height: "100%", width: "100%" }}
          />

          {/* Info overlay */}
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: COLORS.blackOverlay,
              backdropFilter: "blur(4px)",
              borderRadius: 1,
              px: 1.5,
              py: 0.75,
            }}
          >
            <InfoOutlinedIcon
              sx={{ fontSize: 16, color: COLORS.whiteMedium }}
            />
            <Typography variant="caption" sx={{ color: COLORS.whiteMedium }}>
              Hover over cells to see details
            </Typography>
          </Box>
        </Box>

        {/* Sidebar */}
        <Box
          sx={{
            width: 280,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            flexShrink: 0,
          }}
        >
          <StatsPanel cells={cells} />
          <PaybackLegend />
        </Box>
      </Box>
    </Box>
  );
}
