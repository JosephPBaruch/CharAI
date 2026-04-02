import type { FeatureCollection } from "geojson";
import type { LatLngLiteral } from "leaflet";
import type React from "react";

export interface CoordinateScreenProps {
  coordinates: LatLngLiteral[];
  setCoordinates: React.Dispatch<React.SetStateAction<LatLngLiteral[]>>;
}

export interface CoordinateStepperProps {
  handleClose: () => void;
}

export interface CoordinateFileUploadScreenProps {
  fileType: FileTypes;
  setCoordinates: React.Dispatch<React.SetStateAction<LatLngLiteral[]>>;
  handleNext: () => void;
}

export type FileTypes = "text" | "visual" | null;

export interface FileTypeSeparationScreenProps {
  setFileType: React.Dispatch<React.SetStateAction<FileTypes>>;
  handleNext: () => void;
}

export interface FileUploadScreenProps {
  MAX_NUMBER_OF_BYTES: number;
  acceptedFileTypeObject: {};
  handleAcceptedFile: (acceptedFiles: File[]) => void;
  handleRejectedFile: () => void;
  handleError: () => void;
  errorMessage: string;
  file: File;
}

export interface CoordinateContextType {
  data: FeatureCollection | null;
  isLoading: boolean;
  hasCoordinates: boolean;
  formSubmitted: boolean;
  setCoordinateData: (data: FeatureCollection | LatLngLiteral[]) => void; // accepts GeoJSON or raw lat/lng array
  setFormSubmitted: (submitted: boolean) => void;
  clearCoordinateData: () => void;
}

export type ParseResult =
  | { success: true; data: LatLngLiteral[] }
  | { success: false; error: string };
