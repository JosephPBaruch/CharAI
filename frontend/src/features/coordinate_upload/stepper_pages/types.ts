import type { LatLngLiteral } from "leaflet";

export interface CoordinateFileUploadScreenProps {
  coordinates: LatLngLiteral[];
  setCoordinates: React.Dispatch<React.SetStateAction<LatLngLiteral[]>>;
}
