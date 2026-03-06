export interface GridCell {
  bounds: L.LatLngBounds;
  paybackPeriod: number;
}

export interface GeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  properties: {
    featureType: "gridCell" | "boundary";
    index?: number;
    paybackPeriod?: number;
    applicationRate?: number;
    cellSize?: number;
  };
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export interface StatsPanelProps {
  cells: GridCell[];
}

export type FieldDialogProps = {
  open: boolean;
  onClose: () => void;
  id: string;
};
