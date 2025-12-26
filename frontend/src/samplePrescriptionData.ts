import type { FeatureCollection, Feature, Polygon } from 'geojson';

// Point-in-polygon (ray casting) for simple polygon rings
function pointInPolygon(point: [number, number], ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > point[1]) !== (yj > point[1])) &&
      (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi + 0.0000001) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Helper to build a square polygon given bottom-left corner and size in degrees
function square(lng: number, lat: number, sizeDeg = 0.0007): Feature<Polygon, Record<string, any>> {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [lng, lat],
        [lng + sizeDeg, lat],
        [lng + sizeDeg, lat + sizeDeg],
        [lng, lat + sizeDeg],
        [lng, lat]
      ]]
    }
  };
}

// Convex farm boundary (pentagon) near Boise, ID
const boundary: Feature<Polygon, { type: string }> = {
  type: 'Feature',
  properties: { type: 'boundary' },
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [-116.2425, 43.6025],
      [-116.2395, 43.6032],
      [-116.2379, 43.6006],
      [-116.2393, 43.5984],
      [-116.2419, 43.5981],
      [-116.2425, 43.6025]
    ]]
  }
};

// Generate a small pixelated grid inside boundary bbox
const gridOrigin = { lng: -116.2418, lat: 43.5986 };
const cellSize = 0.0007; // ~78m
const rows = 4;
const cols = 4;

const grid: Feature<Polygon, Record<string, any>>[] = [];
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const lng = gridOrigin.lng + c * cellSize;
    const lat = gridOrigin.lat + r * cellSize;
    const f = square(lng, lat, cellSize);
    // Uniform application rate for all squares; vary paybackPeriod numerically
    const paybackOptions = [4, 8, 12, 18, 28]; // months
    const idx = (r + c) % paybackOptions.length;
    const center: [number, number] = [lng + cellSize / 2, lat + cellSize / 2];
    f.properties = {
      applicationRate: 120, // same rate across field
      paybackPeriod: paybackOptions[idx]
    };
    // Include only squares whose center falls within the boundary (approximate clipping)
    const ring = boundary.geometry.coordinates[0] as [number, number][];
    if (pointInPolygon(center, ring)) {
      grid.push(f);
    }
  }
}

export const samplePrescriptionData: FeatureCollection = {
  type: 'FeatureCollection',
  features: [boundary, ...grid]
};
