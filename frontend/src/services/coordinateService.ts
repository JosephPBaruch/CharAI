// Temporary localStorage-based coordinate service
// TODO: Replace with backend API calls when ready

import type { FeatureCollection } from 'geojson';

// Placeholder function for file parsing
// In the future, backend will handle file upload and return parsed GeoJSON
export function parseFileToGeoJSON(file: File): Promise<FeatureCollection> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        // For now, assume file is valid GeoJSON
        // TODO: Implement proper file parsing or delegate to backend
        const geojson = JSON.parse(content) as FeatureCollection;
        resolve(geojson);
      } catch (err) {
        reject(new Error('Failed to parse file as GeoJSON'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
