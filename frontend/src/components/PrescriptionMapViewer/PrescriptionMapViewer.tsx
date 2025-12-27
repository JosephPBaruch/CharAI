import { Box, Typography, Button, Container } from "@mui/material";
import { COLORS } from '../../styles/colors';
import React from "react";
import { useNavigate } from 'react-router';
import { useCoordinates } from '../../contexts/CoordinateContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type LatLng = { lat: number; lng: number };

interface GridCell {
  bounds: L.LatLngBounds;
  paybackPeriod: number;
  applicationRate: number;
}

interface PrescriptionMapViewerProps {
  data?: LatLng[] | null;
  height?: number | string;
  width?: number | string;
}

// Color scale for payback period (1-10)
const getColorForPayback = (paybackPeriod: number): string => {
  if (paybackPeriod <= 2) return '#1a9641';      // green
  if (paybackPeriod <= 4) return '#a6d96a';      // light green
  if (paybackPeriod <= 6) return '#f9d423';      // yellow
  if (paybackPeriod <= 8) return '#f58634';      // orange
  return '#d7191c';                               // red
};

// Point-in-polygon test using ray casting algorithm
const pointInPolygon = (point: LatLng, polygon: LatLng[]): boolean => {
  let inside = false;
  const x = point.lng;
  const y = point.lat;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
};

// Convert meters to degrees (approximate)
const metersToDegreesLat = (meters: number): number => meters / 111320;
const metersToDegreesLng = (meters: number, lat: number): number => 
  meters / (111320 * Math.cos(lat * Math.PI / 180));

// Generate grid cells inside a polygon boundary
const generateGridCells = (boundary: LatLng[], cellSizeMeters: number): GridCell[] => {
  if (boundary.length < 3) return [];
  
  // Find bounding box
  let minLat = Infinity, maxLat = -Infinity;
  let minLng = Infinity, maxLng = -Infinity;
  
  for (const pt of boundary) {
    minLat = Math.min(minLat, pt.lat);
    maxLat = Math.max(maxLat, pt.lat);
    minLng = Math.min(minLng, pt.lng);
    maxLng = Math.max(maxLng, pt.lng);
  }
  
  const centerLat = (minLat + maxLat) / 2;
  const cellSizeLat = metersToDegreesLat(cellSizeMeters);
  const cellSizeLng = metersToDegreesLng(cellSizeMeters, centerLat);
  
  const cells: GridCell[] = [];
  
  // Generate grid cells
  for (let lat = minLat; lat < maxLat; lat += cellSizeLat) {
    for (let lng = minLng; lng < maxLng; lng += cellSizeLng) {
      // Check if cell center is inside polygon
      const cellCenter: LatLng = {
        lat: lat + cellSizeLat / 2,
        lng: lng + cellSizeLng / 2,
      };
      
      if (pointInPolygon(cellCenter, boundary)) {
        const bounds = L.latLngBounds(
          [lat, lng],
          [lat + cellSizeLat, lng + cellSizeLng]
        );
        
        cells.push({
          bounds,
          paybackPeriod: Math.floor(Math.random() * 10) + 1,
          applicationRate: 5,
        });
      }
    }
  }
  
  return cells;
};

class GridCanvasLayer extends L.Layer {
  private _canvas: HTMLCanvasElement | null = null;
  private _cells: GridCell[] = [];
  private _mapInstance: L.Map | null = null;
  private _onHover: ((cell: GridCell | null, e: MouseEvent) => void) | null = null;
  private _hoveredCell: GridCell | null = null;

  constructor(cells: GridCell[], onHover?: (cell: GridCell | null, e: MouseEvent) => void) {
    super();
    this._cells = cells;
    this._onHover = onHover || null;
  }

  onAdd(map: L.Map): this {
    this._mapInstance = map;

    // Main canvas
    this._canvas = L.DomUtil.create('canvas', 'leaflet-grid-canvas') as HTMLCanvasElement;
    this._canvas.style.position = 'absolute';
    this._canvas.style.pointerEvents = 'auto';

    const pane = map.getPane('overlayPane');
    if (pane) pane.appendChild(this._canvas);

    // Events - include 'move' for smooth panning
    map.on('move moveend zoomend resize', this._reset, this);
    this._canvas.addEventListener('mousemove', this._onMouseMove.bind(this));
    this._canvas.addEventListener('mouseout', this._onMouseOut.bind(this));

    this._reset();
    return this;
  }

  onRemove(map: L.Map): this {
    if (this._canvas?.parentNode) this._canvas.parentNode.removeChild(this._canvas);
    map.off('move moveend zoomend resize', this._reset, this);
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
    const ctx = this._canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

    if (this._cells.length === 0) return;

    // Get visible bounds for culling
    const viewBounds = this._mapInstance.getBounds();

    // Draw all cells (already filtered to polygon in generateGridCells)
    for (const cell of this._cells) {
      // Skip cells outside the current view
      if (!viewBounds.intersects(cell.bounds)) continue;

      const sw = this._mapInstance.latLngToContainerPoint(cell.bounds.getSouthWest());
      const ne = this._mapInstance.latLngToContainerPoint(cell.bounds.getNorthEast());

      const x = sw.x;
      const y = ne.y;
      const w = ne.x - sw.x;
      const h = sw.y - ne.y;

      // Fill cell
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = getColorForPayback(cell.paybackPeriod);
      ctx.fillRect(x, y, w, h);

      // Stroke cell (only if large enough to see)
      if (w > 3 && h > 3) {
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, w, h);
      }
    }

    // Draw hover highlight
    if (this._hoveredCell) {
      const sw = this._mapInstance.latLngToContainerPoint(this._hoveredCell.bounds.getSouthWest());
      const ne = this._mapInstance.latLngToContainerPoint(this._hoveredCell.bounds.getNorthEast());

      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#fff';
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
      const sw = this._mapInstance.latLngToContainerPoint(cell.bounds.getSouthWest());
      const ne = this._mapInstance.latLngToContainerPoint(cell.bounds.getNorthEast());

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
      if (this._onHover) this._onHover(null, new MouseEvent('mouseout'));
    }
  }
}

export default function PrescriptionMapViewer({ data, height = '400px', width = '100%' }: PrescriptionMapViewerProps) {
  const navigate = useNavigate();
  const { data: committedCoords, hasCoordinates, isLoading, clearCoordinateData, formSubmitted, setFormSubmitted } = useCoordinates();
  
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  const gridLayerRef = React.useRef<GridCanvasLayer | null>(null);
  const boundaryLayerRef = React.useRef<L.Polyline | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);
  
  // Extract boundary coordinates from context or data prop
  const boundaryCoords = React.useMemo<LatLng[]>(() => {
    // Direct array of coords
    if (Array.isArray(data) && data.length > 0 && 'lat' in data[0]) {
      return data as LatLng[];
    }
    
    // From context (GeoJSON FeatureCollection)
    if (committedCoords && (committedCoords as any).type === 'FeatureCollection') {
      const fc = committedCoords as any;
      const polyFeature = fc.features?.find(
        (f: any) => f.geometry?.type === 'Polygon'
      );
      
      if (polyFeature?.geometry?.coordinates?.[0]) {
        // GeoJSON is [lng, lat], convert to {lat, lng}
        return polyFeature.geometry.coordinates[0].map((coord: [number, number]) => ({
          lat: coord[1],
          lng: coord[0],
        }));
      }
    }
    
    return [];
  }, [data, committedCoords]);

  // Initialize map
  React.useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    const map = L.map(mapContainerRef.current, {
      center: [46.7, -116.96],
      zoom: 14,
    });
    
    mapRef.current = map;
    
    // Add ESRI satellite imagery
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri',
      maxZoom: 20,
    }).addTo(map);
    
    // Add ESRI labels
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 20,
    }).addTo(map);
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
      position: absolute;
      background: white;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 12px;
      color: #111;
      pointer-events: none;
      z-index: 1000;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: none;
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
  }, []);

  // Update boundary and grid when data changes
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || boundaryCoords.length < 3 || !formSubmitted) return;
    
    // Remove old layers
    if (boundaryLayerRef.current) {
      map.removeLayer(boundaryLayerRef.current);
    }
    if (gridLayerRef.current) {
      map.removeLayer(gridLayerRef.current);
    }
    
    // Draw boundary line
    const latLngs = boundaryCoords.map(c => L.latLng(c.lat, c.lng));
    latLngs.push(latLngs[0]); // Close the polygon
    
    const boundaryLine = L.polyline(latLngs, {
      color: '#FFD700',
      weight: 3,
      opacity: 1,
    }).addTo(map);
    
    boundaryLayerRef.current = boundaryLine;
    
    // Generate grid cells (100m x 100m)
    const cells = generateGridCells(boundaryCoords, 25);
    console.log(`[PrescriptionMapViewer] Generated ${cells.length} grid cells`);
    
    // Hover handler for tooltip
    const handleHover = (cell: GridCell | null, e: MouseEvent) => {
      if (!tooltipRef.current) return;
      
      if (cell) {
        tooltipRef.current.innerHTML = `
          <strong>Payback Period:</strong> ${cell.paybackPeriod}<br/>
          <strong>Application Rate:</strong> ${cell.applicationRate}
        `;
        tooltipRef.current.style.display = 'block';
        tooltipRef.current.style.left = `${e.clientX + 12}px`;
        tooltipRef.current.style.top = `${e.clientY + 12}px`;
      } else {
        tooltipRef.current.style.display = 'none';
      }
    };
    
    // Add grid canvas layer
    const gridLayer = new GridCanvasLayer(cells, handleHover);
    gridLayer.addTo(map);
    gridLayerRef.current = gridLayer;
    
    // Fit bounds to boundary
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [40, 40] });
    
  }, [boundaryCoords, formSubmitted]);

  // Clear grid when form not submitted
  React.useEffect(() => {
    if (!formSubmitted && mapRef.current) {
      if (boundaryLayerRef.current) {
        mapRef.current.removeLayer(boundaryLayerRef.current);
        boundaryLayerRef.current = null;
      }
      if (gridLayerRef.current) {
        mapRef.current.removeLayer(gridLayerRef.current);
        gridLayerRef.current = null;
      }
    }
  }, [formSubmitted]);

  return (
    <Box>
      {/* Guard: show message if no coordinates or form not submitted */}
      {!isLoading && (!hasCoordinates || !formSubmitted) && (
        <Container maxWidth="sm">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              textAlign: 'center',
              gap: 2,
            }}
          >
            <Typography variant="h5" sx={{ color: COLORS.whiteHigh, fontWeight: 700 }}>
              No Farm Coordinates Found
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.whiteMedium, maxWidth: 400 }}>
              To view prescription maps, please submit your farm configuration with boundary coordinates.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{
                backgroundColor: COLORS.indigo,
                '&:hover': { backgroundColor: '#7a81ff' },
              }}
            >
              Go to Input Page
            </Button>
          </Box>
        </Container>
      )}

      {/* Show map only when coordinates are committed AND form was submitted */}
      {!isLoading && hasCoordinates && formSubmitted && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                clearCoordinateData();
                setFormSubmitted(false);
                navigate('/');
              }}
              sx={{ textTransform: 'none' }}
            >
              Reset and re-enter farm info
            </Button>
          </Box>

          <Typography variant="body2" sx={{ color: COLORS.whiteMedium, mb: 1 }}>
            Displaying farm boundary and grid cells with estimated payback periods. Hover over cells for details.
          </Typography>

          <Box sx={{ height, width, position: 'relative' }}>
            <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
          </Box>
        </>
      )}
    </Box>
  );
}
