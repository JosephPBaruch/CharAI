import type { GeoJSONFeatureCollection, GridCell } from "./types";
import { COLORS } from "../../styles/colors";
import L from "leaflet";

export const getBoundaryLatLngs = (
  geojson: GeoJSONFeatureCollection,
): L.LatLng[] => {
  const boundaryFeature = geojson.features.find(
    (f) => f.properties.featureType === "boundary",
  );

  if (!boundaryFeature) return [];

  const coords = boundaryFeature.geometry.coordinates[0];

  return coords.map(([lng, lat]) => L.latLng(lat, lng));
};

export const getGridCellLatLngs = (
  geojson: GeoJSONFeatureCollection,
): GridCell[] => {
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
export const getColorForPayback = (paybackPeriod: number): string => {
  if (paybackPeriod <= 2) return COLORS.dataGreen;
  if (paybackPeriod <= 4) return COLORS.dataLightGreen;
  if (paybackPeriod <= 6) return COLORS.dataYellow;
  if (paybackPeriod <= 8) return COLORS.dataOrange;
  return COLORS.dataRed;
};
