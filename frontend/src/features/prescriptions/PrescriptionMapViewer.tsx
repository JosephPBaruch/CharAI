import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Stack,
  CircularProgress,
} from "@mui/material";
import { COLORS } from "../../styles/colors";
import React from "react";
import { useNavigate } from "react-router";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapIcon from "@mui/icons-material/Map";
import GridOnIcon from "@mui/icons-material/GridOn";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { GETFields, GETPrescriptionMap } from "../../api/fetch";

interface GridCell {
  bounds: L.LatLngBounds;
  paybackPeriod: number;
}

interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  properties: {
    featureType: "gridCell" | "boundary0";
    index?: number;
    paybackPeriod?: number;
    applicationRate?: number;
    cellSize?: number;
  };
}

interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

const getBoundaryLatLngs = (geojson: GeoJSONFeatureCollection): L.LatLng[] => {
  const boundaryFeature = geojson.features.find(
    (f) => f.properties.featureType === "boundary0",
  );

  if (!boundaryFeature) return [];

  const coords = boundaryFeature.geometry.coordinates[0];

  return coords.map(([lng, lat]) => L.latLng(lat, lng));
};

const getGridCellLatLngs = (geojson: GeoJSONFeatureCollection): GridCell[] => {
  return geojson.features
    .filter((f) => f.properties.featureType === "gridCell")
    .map((feature) => {
      const coords = feature.geometry.coordinates[0];
      const latLngs = coords.map(([lng, lat]) => L.latLng(lat, lng));
      const bounds = L.latLngBounds(latLngs);

      return {
        bounds,
        paybackPeriod: feature.properties.paybackPeriod ?? 0,
      };
    });
};

// Color scale for payback period (1-10)
const getColorForPayback = (paybackPeriod: number): string => {
  if (paybackPeriod <= 2) return COLORS.dataRed; // green
  if (paybackPeriod <= 4) return COLORS.dataOrange; // light green
  if (paybackPeriod <= 6) return COLORS.dataYellow; // yellow
  if (paybackPeriod <= 8) return COLORS.dataLightGreen; // orange
  return COLORS.dataGreen; // red
};

class GridCanvasLayer extends L.Layer {
  private _canvas: HTMLCanvasElement | null = null;
  private _cells: GridCell[] = [];
  private _mapInstance: L.Map | null = null;
  private _onHover: ((cell: GridCell | null, e: MouseEvent) => void) | null =
    null;
  private _hoveredCell: GridCell | null = null;

  constructor(
    cells: GridCell[],
    onHover?: (cell: GridCell | null, e: MouseEvent) => void,
  ) {
    super();
    this._cells = cells;
    this._onHover = onHover || null;
  }

  onAdd(map: L.Map): this {
    this._mapInstance = map;
    this._canvas = L.DomUtil.create(
      "canvas",
      "leaflet-grid-canvas",
    ) as HTMLCanvasElement;
    this._canvas.style.position = "absolute";
    this._canvas.style.pointerEvents = "auto";

    const pane = map.getPane("overlayPane");
    if (pane) pane.appendChild(this._canvas);

    map.on("move moveend zoomend resize", this._reset, this);
    this._canvas.addEventListener("mousemove", this._onMouseMove.bind(this));
    this._canvas.addEventListener("mouseout", this._onMouseOut.bind(this));

    this._reset();
    return this;
  }

  onRemove(map: L.Map): this {
    if (this._canvas?.parentNode)
      this._canvas.parentNode.removeChild(this._canvas);
    map.off("move moveend zoomend resize", this._reset, this);
    this._canvas = null;
    this._mapInstance = null;
    return this;
  }

  setCells(cells: GridCell[]): void {
    this._cells = cells;
    this._reset();
  }

  private _reset(): void {
    if (!this._mapInstance || !this._canvas) return;

    const size = this._mapInstance.getSize();
    const bounds = this._mapInstance.getBounds();
    const topLeft = this._mapInstance.latLngToLayerPoint(bounds.getNorthWest());

    this._canvas.width = size.x;
    this._canvas.height = size.y;
    this._canvas.style.width = `${size.x}px`;
    this._canvas.style.height = `${size.y}px`;
    L.DomUtil.setPosition(this._canvas, topLeft);

    this._draw();
  }

  private _draw(): void {
    if (!this._mapInstance || !this._canvas) return;
    const ctx = this._canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    if (this._cells.length === 0) return;

    const viewBounds = this._mapInstance.getBounds();

    for (const cell of this._cells) {
      if (!viewBounds.intersects(cell.bounds)) continue;

      const sw = this._mapInstance.latLngToContainerPoint(
        cell.bounds.getSouthWest(),
      );
      const ne = this._mapInstance.latLngToContainerPoint(
        cell.bounds.getNorthEast(),
      );

      const x = sw.x;
      const y = ne.y;
      const w = ne.x - sw.x;
      const h = sw.y - ne.y;

      ctx.globalAlpha = 0.7;
      ctx.fillStyle = getColorForPayback(cell.paybackPeriod);
      ctx.fillRect(x, y, w, h);

      if (w > 3 && h > 3) {
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = COLORS.strokeDark;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, w, h);
      }
    }

    if (this._hoveredCell) {
      const sw = this._mapInstance.latLngToContainerPoint(
        this._hoveredCell.bounds.getSouthWest(),
      );
      const ne = this._mapInstance.latLngToContainerPoint(
        this._hoveredCell.bounds.getNorthEast(),
      );
      ctx.globalAlpha = 1;
      ctx.strokeStyle = COLORS.whiteFull;
      ctx.lineWidth = 2;
      ctx.strokeRect(sw.x, ne.y, ne.x - sw.x, sw.y - ne.y);
    }

    ctx.globalAlpha = 1;
  }

  private _onMouseMove(e: MouseEvent): void {
    if (!this._mapInstance || !this._canvas) return;

    const rect = this._canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let foundCell: GridCell | null = null;

    for (const cell of this._cells) {
      const sw = this._mapInstance.latLngToContainerPoint(
        cell.bounds.getSouthWest(),
      );
      const ne = this._mapInstance.latLngToContainerPoint(
        cell.bounds.getNorthEast(),
      );

      if (x >= sw.x && x <= ne.x && y >= ne.y && y <= sw.y) {
        foundCell = cell;
        break;
      }
    }

    if (foundCell !== this._hoveredCell) {
      this._hoveredCell = foundCell;
      this._draw();
      if (this._onHover) this._onHover(foundCell, e);
    }
  }

  private _onMouseOut(): void {
    if (this._hoveredCell) {
      this._hoveredCell = null;
      this._draw();
      if (this._onHover) this._onHover(null, new MouseEvent("mouseout"));
    }
  }
}

// Legend component
const PaybackLegend: React.FC = () => {
  const legendItems = [
    { range: "1-2 years", color: COLORS.dataRed, label: "Very High Priority" },
    { range: "3-4 years", color: COLORS.dataOrange, label: "High Priority" },
    { range: "5-6 years", color: COLORS.dataYellow, label: "Medium Priority" },
    { range: "7-8 years", color: COLORS.dataLightGreen, label: "Low Priority" },
    {
      range: "9-10 years",
      color: COLORS.dataGreen,
      label: "Very Low Priority",
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: COLORS.blackOverlay,
        backdropFilter: "blur(8px)",
        border: `1px solid ${COLORS.whiteVeryLow}`,
        borderRadius: 2,
        p: 2,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          color: COLORS.whiteHigh,
          fontWeight: 600,
          mb: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        Payback Period Legend
      </Typography>
      <Stack spacing={0.75}>
        {legendItems.map((item) => (
          <Box
            key={item.range}
            sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
          >
            <Box
              sx={{
                width: 20,
                height: 14,
                backgroundColor: item.color,
                borderRadius: 0.5,
                border: `1px solid ${COLORS.blackLow}`,
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: COLORS.whiteMedium, flex: 1 }}
            >
              {item.range}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: COLORS.whiteHigh, fontWeight: 500 }}
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

// Stats panel component
interface StatsPanelProps {
  cells: GridCell[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ cells }) => {
  const avgPayback =
    cells.length > 0
      ? (
          cells.reduce((sum, c) => sum + c.paybackPeriod, 0) / cells.length
        ).toFixed(1)
      : "0";

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: COLORS.blackOverlay,
        backdropFilter: "blur(8px)",
        border: `1px solid ${COLORS.whiteVeryLow}`,
        borderRadius: 2,
        p: 2,
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          color: COLORS.whiteHigh,
          fontWeight: 600,
          mb: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <GridOnIcon fontSize="small" />
        Analysis Summary
      </Typography>

      <Stack spacing={1.5}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" sx={{ color: COLORS.whiteMedium }}>
            Total Grid Cells
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: COLORS.whiteHigh, fontWeight: 600 }}
          >
            {cells.length.toLocaleString()}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" sx={{ color: COLORS.whiteMedium }}>
            Avg. Payback Period
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: COLORS.whiteHigh, fontWeight: 600 }}
          >
            {avgPayback} years
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default function PrescriptionMapViewer() {
  const navigate = useNavigate();

  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  const gridLayerRef = React.useRef<GridCanvasLayer | null>(null);
  const boundaryLayerRef = React.useRef<L.Polygon | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);

  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [prescriptionData, setPrescriptionData] =
    React.useState<GeoJSONFeatureCollection | null>(null);
  const [cells, setCells] = React.useState<GridCell[]>([]);

  // Fetch backend data
  React.useEffect(() => {
    GETFields().then((fields) => {
      console.log("Fields from backend:", fields);

      const fieldId = fields["fields"][0]["field_id"].toString();
      if (!fieldId) {
        setIsLoading(false);
        return;
      }

      GETPrescriptionMap(fieldId)
        .then((data) => {
          console.log("Prescription map data from backend:", data);

          const geojson = data.prescription_data as GeoJSONFeatureCollection;
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

  // Loading state
  if (isLoading) return <CircularProgress />;

  // Empty state
  if (!prescriptionData) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "70vh",
            textAlign: "center",
            gap: 3,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: COLORS.indigoLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MapIcon sx={{ fontSize: 40, color: COLORS.indigo }} />
          </Box>

          <Box>
            <Typography
              variant="h4"
              sx={{ color: COLORS.whiteHigh, fontWeight: 700, mb: 1 }}
            >
              No Prescription Data
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: COLORS.whiteMedium, maxWidth: 400 }}
            >
              To view prescription maps and biochar application recommendations,
              please submit your farm configuration with boundary coordinates.
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/")}
            sx={{
              backgroundColor: COLORS.indigo,
              px: 4,
              py: 1.5,
              "&:hover": { backgroundColor: COLORS.indigoHover },
            }}
          >
            Configure Farm Data
          </Button>
        </Box>
      </Container>
    );
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
