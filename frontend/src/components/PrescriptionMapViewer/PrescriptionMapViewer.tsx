import { Box, Typography, Button, Container } from "@mui/material";
import type { FeatureCollection } from 'geojson';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { COLORS } from '../../styles/colors';
import React from "react";
import { useNavigate } from 'react-router';
import { samplePrescriptionData } from "../../samplePrescriptionData";
import { computeBoundsFromGeoJSON } from '../../types/maplibre/bounds';
import { priorityFillColorExpression } from '../../types/maplibre/priorityStyle';
import { useCoordinates } from '../../contexts/CoordinateContext';

interface PrescriptionMapViewerProps {
  /** A GeoJSON FeatureCollection from the backend. Expect the outer polygon (farm boundary)
   * and inner polygons (prescription zones) with properties such as
   * { applicationRate: number, paybackPeriod: number }
   */
  data?: FeatureCollection | null;
  height?: number | string;
  width?: number | string;
}

export default function PrescriptionMapViewer({ data = samplePrescriptionData, height = '400px', width = '100%' }: PrescriptionMapViewerProps) {
  const navigate = useNavigate();
  const { hasCoordinates, isLoading } = useCoordinates();
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);
  const popupRef = React.useRef<maplibregl.Popup | null>(null);

  React.useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: 'https://demotiles.maplibre.org/style.json',
        center: [-110, 44.5],
        zoom: 4,
      });

      mapRef.current = map;

      const sourceId = 'prescription-data';
      const fillLayerId = 'prescription-fill';
      const outlineLayerId = 'prescription-outline';

      map.on('load', () => {
        map.addSource(sourceId, {
          type: 'geojson',
          data: (data ?? samplePrescriptionData) as any,
        });

        map.addLayer({
          id: fillLayerId,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': priorityFillColorExpression as any,
            'fill-opacity': 0.6,
          },
        });

        map.addLayer({
          id: outlineLayerId,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#222',
            'line-width': 1.5,
            'line-opacity': 0.9,
          },
        });

        popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 });

        map.on('mouseenter', fillLayerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mousemove', fillLayerId, (e) => {
          const feature = e.features && e.features[0];
          const props: any = feature?.properties || {};
          const applicationRate = props.applicationRate ?? props.rate ?? 'n/a';
          const payback = props.paybackPeriod ?? 'n/a';
          const html = `<div style="color:#111"><strong>Payback Period:</strong> ${payback}<br/><strong>Application Rate:</strong> ${applicationRate}</div>`;
          if (popupRef.current) {
            popupRef.current.setLngLat(e.lngLat).setHTML(html).addTo(map);
          }
        });

        map.on('mouseleave', fillLayerId, () => {
          map.getCanvas().style.cursor = '';
          popupRef.current && popupRef.current.remove();
        });

        if (data) {
          const b = computeBoundsFromGeoJSON(data);
          if (b) {
            map.fitBounds(b, { padding: 20 });
          }
        }
      });
    }

    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource('prescription-data') as maplibregl.GeoJSONSource | undefined;
    if (source && data) {
      source.setData(data as any);
      const b = computeBoundsFromGeoJSON(data);
      if (b) {
        map.fitBounds(b, { padding: 20 });
      }
    }
  }, [data]);

  return (
    <Box>
      {/* Guard: if no coordinates and not loading, prompt user to input */}
      {!isLoading && !hasCoordinates && (
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
              To view prescription maps, you need to first submit farm boundary coordinates. Please upload a coordinate file or manually define your farm area.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/')}
              sx={{ backgroundColor: COLORS.indigo, '&:hover': { backgroundColor: '#7a81ff' } }}
            >
              Go to Input Page
            </Button>
          </Box>
        </Container>
      )}

      {/* Show map only when coordinates are available */}
      {!isLoading && hasCoordinates && (
        <>
          {!data && (
            <Typography variant="body2" sx={{ color: COLORS.whiteMedium }}>
              No prescription data available. Upload a GeoJSON from the backend to preview application zones.
            </Typography>
          )}

          <Box sx={{ height, width }}>
            <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
          </Box>
        </>
      )}
    </Box>
  );
}
