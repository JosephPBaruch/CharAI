import type { FeatureCollection, Geometry } from 'geojson';

// Compute LngLatBoundsLike ([[minLng, minLat], [maxLng, maxLat]]) from a GeoJSON FeatureCollection
export function computeBoundsFromGeoJSON(data: FeatureCollection): [[number, number], [number, number]] | null {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const expand = (coords: any): void => {
    if (!coords) return;
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      const lng = coords[0];
      const lat = coords[1];
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
    } else if (Array.isArray(coords)) {
      for (const c of coords) expand(c);
    }
  };

  for (const feature of data.features) {
    const geom: Geometry | null = feature.geometry as any;
    if (!geom) continue;
    switch (geom.type) {
      case 'Point':
      case 'MultiPoint':
      case 'LineString':
      case 'MultiLineString':
      case 'Polygon':
      case 'MultiPolygon':
        expand((geom as any).coordinates);
        break;
      case 'GeometryCollection':
        for (const g of (geom as any).geometries || []) {
          expand((g as any).coordinates);
        }
        break;
      default:
        break;
    }
  }

  if (minLng === Infinity || minLat === Infinity || maxLng === -Infinity || maxLat === -Infinity) {
    return null;
  }

  return [[minLng, minLat], [maxLng, maxLat]];
}
