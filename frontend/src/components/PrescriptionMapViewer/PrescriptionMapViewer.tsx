import { Box, Typography, Button, Container } from "@mui/material";
import type { Feature, FeatureCollection, Point, Polygon } from 'geojson';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { COLORS } from '../../styles/colors';
import React from "react";
import { useNavigate } from 'react-router';
import { samplePrescriptionData } from "../../samplePrescriptionData";
import { computeBoundsFromGeoJSON } from '../../types/maplibre/bounds';
import { priorityFillColorExpression } from '../../types/maplibre/priorityStyle';
import { useCoordinates } from '../../contexts/CoordinateContext';
import * as turf from '@turf/turf';

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
  const { hasCoordinates, isLoading, clearCoordinateData, formSubmitted, setFormSubmitted } = useCoordinates();
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);
  const popupRef = React.useRef<maplibregl.Popup | null>(null);
  const pointsSourceId = 'grid-points';
  const pointsLayerId = 'grid-points-circle';
  const [gridPoints, setGridPoints] = React.useState<FeatureCollection<Point>>({ type: 'FeatureCollection', features: [] });

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

        // Points source/layer for grid visualization
        map.addSource(pointsSourceId, {
          type: 'geojson',
          data: gridPoints as any,
        });

        map.addLayer({
          id: pointsLayerId,
          type: 'circle',
          source: pointsSourceId,
          paint: {
            'circle-color': [
              'case',
              ['has', 'paybackPeriod'],
              ['step', ['get', 'paybackPeriod'],
                '#1a9641',
                2, '#a6d96a',
                4, '#f9d423',
                6, '#f58634',
                8, '#d7191c'
              ],
              '#999999'
            ],
            'circle-radius': [
              'interpolate', ['linear'], ['zoom'],
              4, ['+', 3, ['coalesce', ['get', 'applicationRate'], 5]],
              10, ['+', 1, ['coalesce', ['get', 'applicationRate'], 5]]
            ],
            'circle-opacity': 0.85,
            'circle-stroke-color': '#111',
            'circle-stroke-width': 0.5,
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

  // Utility: compute N x N resolution based on bbox
  function computeResolution(polygon: Feature<Polygon>, targetN = 20) {
    const bbox = turf.bbox(polygon);
    const [minX, minY, maxX, maxY] = bbox;
    const widthDeg = Math.abs(maxX - minX);
    const heightDeg = Math.abs(maxY - minY);
    // Choose spacing so that roughly targetN points per side
    const spacingX = widthDeg / targetN;
    const spacingY = heightDeg / targetN;
    // Use min spacing to avoid huge counts if aspect ratio extreme
    const spacing = Math.min(spacingX, spacingY);
    return Math.max(spacing, 0.0001); // guard minimal spacing
  }

  // Generate points inside polygon
  function regenerateGrid(polygonFC: FeatureCollection) {
    const polyFeature = polygonFC.features.find(f => f.geometry.type === 'Polygon') as Feature<Polygon> | undefined;
    if (!polyFeature) {
      setGridPoints({ type: 'FeatureCollection', features: [] });
      return;
    }
    const spacing = computeResolution(polyFeature, 20);
    const bbox = turf.bbox(polyFeature);
    const pointGrid = turf.pointGrid(bbox, spacing, { mask: polyFeature });
    // Assign properties: applicationRate constant, paybackPeriod random 1-10
    const features = pointGrid.features.map((pt) => {
      const applicationRate = 5;
      const paybackPeriod = Math.floor(Math.random() * 10) + 1;
      return {
        ...pt,
        properties: {
          ...(pt.properties || {}),
          applicationRate,
          paybackPeriod,
        }
      } as Feature<Point>;
    });
    const fc: FeatureCollection<Point> = { type: 'FeatureCollection', features };
    setGridPoints(fc);
    const map = mapRef.current;
    if (map) {
      const src = map.getSource(pointsSourceId) as maplibregl.GeoJSONSource | undefined;
      if (src) src.setData(fc as any);
    }
  }

  // Recompute when the polygon changes (committed coords only)
  React.useEffect(() => {
    if (!hasCoordinates || !formSubmitted) return;
    // If incoming data contains polygon, use that; otherwise read from context committed state
    if (data) {
      regenerateGrid(data);
    }
  }, [data, hasCoordinates, formSubmitted]);

  // Recompute on map move/zoom to adapt circle sizing if necessary (optional)
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handler = () => {
      if (hasCoordinates && formSubmitted && data) {
        regenerateGrid(data);
      }
    };
    map.on('moveend', handler);
    map.on('zoomend', handler);
    return () => {
      map.off('moveend', handler);
      map.off('zoomend', handler);
    };
  }, [hasCoordinates, formSubmitted, data]);

  return (
    <Box>
      {/* Guard: require committed coords AND submitted form */}
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
              sx={{ backgroundColor: COLORS.indigo, '&:hover': { backgroundColor: '#7a81ff' } }}
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
