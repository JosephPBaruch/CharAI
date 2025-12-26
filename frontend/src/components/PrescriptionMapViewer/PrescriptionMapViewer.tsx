import { Box, Typography, Button, Container } from "@mui/material";
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson';
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
  const { data: committedCoords, hasCoordinates, isLoading, clearCoordinateData, formSubmitted, setFormSubmitted } = useCoordinates();
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);
  const popupRef = React.useRef<maplibregl.Popup | null>(null);
  const gridCellsSourceId = 'grid-cells';
  const gridCellsFillLayerId = 'grid-cells-fill';
  const gridCellsOutlineLayerId = 'grid-cells-outline';
  const [gridCells, setGridCells] = React.useState<FeatureCollection<Polygon | MultiPolygon>>({ type: 'FeatureCollection', features: [] });

  // Use explicit data prop for testing; otherwise use committed coordinates from context after user submits
  // This ensures the grid only shows the user's final selected polygon after submission
  const polygonData = React.useMemo<FeatureCollection | null>(() => {
    if (data && data !== samplePrescriptionData) return data as FeatureCollection;
    if (committedCoords) return committedCoords;
    if (data) return data as FeatureCollection; // fallback to prop/sample
    return null;
  }, [data, committedCoords]);

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
          data: (polygonData ?? samplePrescriptionData) as any,
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

        // Grid cells source/layers for square visualization
        map.addSource(gridCellsSourceId, {
          type: 'geojson',
          data: gridCells as any,
        });

        map.addLayer({
          id: gridCellsFillLayerId,
          type: 'fill',
          source: gridCellsSourceId,
          paint: {
            'fill-color': [
              'step', ['get', 'paybackPeriod'],
              '#1a9641',
              2, '#a6d96a',
              4, '#f9d423',
              6, '#f58634',
              8, '#d7191c'
            ],
            'fill-opacity': 0.6,
          },
        });

        map.addLayer({
          id: gridCellsOutlineLayerId,
          type: 'line',
          source: gridCellsSourceId,
          paint: {
            'line-color': '#111',
            'line-width': 1,
            'line-opacity': 0.8,
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

        if (polygonData) {
          const b = computeBoundsFromGeoJSON(polygonData);
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
    const mapInstance = mapRef.current;
    if (!mapInstance) return;
    const source = mapInstance.getSource('prescription-data') as maplibregl.GeoJSONSource | undefined;
    if (source && polygonData) {
      source.setData(polygonData as any);
      const b = computeBoundsFromGeoJSON(polygonData);
      if (b) {
        mapInstance.fitBounds(b, { padding: 20 });
      }
    }
  }, [polygonData]);

  // Utility: compute N x N resolution based on bbox (kilometers per side)
  function computeResolutionKm(polygon: Feature<Polygon | MultiPolygon>, targetN = 20) {
    const bbox = turf.bbox(polygon);
    const [minX, minY, maxX, maxY] = bbox;
    const horizontalKm = turf.distance([minX, minY], [maxX, minY], { units: 'kilometers' });
    const verticalKm = turf.distance([minX, minY], [minX, maxY], { units: 'kilometers' });
    const cellSideKm = Math.min(horizontalKm / targetN, verticalKm / targetN);
    return Math.max(cellSideKm, 0.05); // guard minimal spacing (~50m)
  }

  // Generate square grid cells inside polygon
  function regenerateGrid(polygonFC: FeatureCollection | null) {
    if (!polygonFC || !polygonFC.features || polygonFC.features.length === 0) {
      setGridCells({ type: 'FeatureCollection', features: [] });
      return;
    }

    const polyFeature = polygonFC.features.find(
      f => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
    ) as Feature<Polygon | MultiPolygon> | undefined;
    if (!polyFeature) {
      setGridCells({ type: 'FeatureCollection', features: [] });
      return;
    }

    const cellSideKm = computeResolutionKm(polyFeature, 20);
    const bbox = turf.bbox(polyFeature);
    const rawGrid = turf.squareGrid(bbox, cellSideKm, { units: 'kilometers' });

    const features: Feature<Polygon | MultiPolygon>[] = [];
    rawGrid.features.forEach((cell) => {
      if (!cell || !cell.geometry) return;
      if (cell.geometry.type !== 'Polygon' && cell.geometry.type !== 'MultiPolygon') return;
      try {
        const clipped = turf.intersect(cell as any, polyFeature as any) as Feature<Polygon | MultiPolygon> | null;
        if (!clipped) return;
        if (clipped.geometry.type !== 'Polygon' && clipped.geometry.type !== 'MultiPolygon') return;
        const applicationRate = 5;
        const paybackPeriod = Math.floor(Math.random() * 10) + 1;
        features.push({
          ...clipped,
          properties: {
            ...(clipped.properties || {}),
            applicationRate,
            paybackPeriod,
          }
        });
      } catch (err) {
        console.warn('Skipping grid cell due to clip error', err);
      }
    });

    const fc: FeatureCollection<Polygon | MultiPolygon> = { type: 'FeatureCollection', features };
    setGridCells(fc);

    const map = mapRef.current;
    if (map) {
      const src = map.getSource(gridCellsSourceId) as maplibregl.GeoJSONSource | undefined;
      if (src) src.setData(fc as any);
    }
  }

  // Regenerate grid only when user has submitted final coordinates
  // This triggers after the farm info modal is submitted and committed to context
  React.useEffect(() => {
    if (!formSubmitted) {
      // Clear grid if user hasn't submitted yet
      setGridCells({ type: 'FeatureCollection', features: [] });
      return;
    }
    if (polygonData) {
      regenerateGrid(polygonData);
    }
  }, [formSubmitted, polygonData]);

  // Sync grid cells to map source when they change
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const src = map.getSource(gridCellsSourceId) as maplibregl.GeoJSONSource | undefined;
    if (src) {
      src.setData(gridCells as any);
    }
  }, [gridCells]);

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
