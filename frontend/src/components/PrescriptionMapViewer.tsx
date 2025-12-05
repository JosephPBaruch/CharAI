import { Box, Typography } from "@mui/material";
import type { FeatureCollection } from 'geojson';
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { COLORS } from '../styles/colors';
import React from "react";

interface PrescriptionMapViewerProps {
  /** A GeoJSON FeatureCollection from the backend. Expect the outer polygon (farm boundary)
   * and inner polygons (application zones) as Features with properties like
   * { applicationRate: number, priority: string }
   */
  data?: FeatureCollection | null;
  height?: number | string;
  width?: number | string;
}

const PRIORITY_COLORS: Record<string, string> = {
  'highest-to-high': '#7b1fa2', // deep purple
  'high-to-med-high': '#e91e63',
  'med-high-to-med': '#ff9800',
  'med-to-low': '#ffc107',
  'low': '#c8e6c9',
};

function featureStyle(feature: any) {
  const props = feature?.properties || {};
  const priority: string = (props.priority || props.priorityRange || '').toLowerCase();
  const rate = props.applicationRate ?? props.rate ?? null;

  const fillColor = PRIORITY_COLORS[priority] ?? (rate ? `rgba(100,100,255, ${Math.min(0.85, 0.25 + (rate / 200))})` : '#90caf9');

  return {
    color: '#222',
    weight: 1,
    opacity: 0.9,
    fillColor,
    fillOpacity: 0.6,
  } as L.PathOptions;
}

export default function PrescriptionMapViewer({ data, height = '400px', width = '100%' }: PrescriptionMapViewerProps) {
  // default center if no data
  const defaultCenter: LatLngExpression = [44.5, -110];

  // compute bounds from GeoJSON if provided
  const bounds = data ? L.geoJSON(data).getBounds() : undefined;

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const props = feature?.properties || {};
    const applicationRate = props.applicationRate ?? props.rate ?? 'n/a';
    const priority = props.priority || props.priorityRange || 'n/a';

    const html = `<div style="color:#111"><strong>Priority:</strong> ${priority}<br/><strong>Rate:</strong> ${applicationRate}</div>`;
    if ((layer as any).bindPopup) {
      (layer as any).bindPopup(html);
    }

    // highlight on hover
    layer.on('mouseover', () => {
      (layer as any).setStyle && (layer as any).setStyle({ weight: 2.5, fillOpacity: 0.8 });
    });
    layer.on('mouseout', () => {
      (layer as any).setStyle && (layer as any).setStyle(featureStyle(feature));
    });
  };

  // helper component to fit map bounds when data changes
  function FitBounds({ bounds }: { bounds?: L.LatLngBounds }) {
    const map = useMap();
    React.useEffect(() => {
      if (bounds && map) {
        map.fitBounds(bounds.pad(0.05));
      }
    }, [map, bounds]);
    return null;
  }

  return (
    <Box>
      {!data && (
        <Typography variant="body2" sx={{ color: COLORS.whiteMedium }}>
          No prescription data available. Upload a GeoJSON from the backend to preview application zones.
        </Typography>
      )}

      <Box sx={{ height, width }}>
        <MapContainer center={bounds ? bounds.getCenter() : (defaultCenter as LatLngExpression)} zoom={bounds ? 12 : 4} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {data && (
            <>
              <GeoJSON data={data as any} style={(feature) => featureStyle(feature)} onEachFeature={onEachFeature} />
              <FitBounds bounds={bounds} />
            </>
          )}
        </MapContainer>
      </Box>
    </Box>
  );
}