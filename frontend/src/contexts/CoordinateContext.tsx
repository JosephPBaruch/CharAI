import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { FeatureCollection } from "geojson";
import type { CoordinateContextType } from "../features/coordinate_upload/types";
import type { LatLngLiteral } from "leaflet";

const STORAGE_KEY = "charai_coordinate_data"; // committed/approved coordinates
const SUBMIT_STORAGE_KEY = "charai_farm_submitted";

const CoordinateContext = createContext<CoordinateContextType | undefined>(
  undefined,
);

export function CoordinateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formSubmitted, setFormSubmittedState] = useState<boolean>(false);

  // On mount, load coordinate data from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setData(JSON.parse(stored));
      }

      const storedSubmitted = localStorage.getItem(SUBMIT_STORAGE_KEY);
      if (storedSubmitted) {
        setFormSubmittedState(storedSubmitted === "true");
      }
    } catch (err) {
      console.debug("Failed to load coordinates from localStorage:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper: convert [{lat,lng}, ...] to a closed GeoJSON FeatureCollection with temporary default properties
  const convertCoordinatePairToGeoJSON = (
    coords: LatLngLiteral[],
  ): FeatureCollection | null => {
    if (!coords || coords.length < 3) return null;
    const ring: [number, number][] = coords.map((p) => [p.lng, p.lat]);
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      ring.push([...first]);
    }
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            applicationRate: 5,
            paybackPeriod: 3,
            type: "boundary",
          },
          geometry: {
            type: "Polygon",
            coordinates: [ring],
          },
        },
      ],
    };
  };

  const setCoordinateData = (newData: FeatureCollection | LatLngLiteral[]) => {
    let fc: FeatureCollection | null = null;
    if (Array.isArray(newData)) {
      fc = convertCoordinatePairToGeoJSON(newData);
    } else {
      fc = newData;
    }
    if (!fc) return;
    setData(fc);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fc));
    } catch (err) {
      console.error("Failed to save pending coordinates to localStorage:", err);
    }
  };

  const setFormSubmitted = (submitted: boolean) => {
    setFormSubmittedState(submitted);
    try {
      localStorage.setItem(SUBMIT_STORAGE_KEY, submitted ? "true" : "false");
    } catch (err) {
      console.error("Failed to save submission flag to localStorage:", err);
    }
  };

  const clearCoordinateData = () => {
    setData(null);
    setFormSubmittedState(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(SUBMIT_STORAGE_KEY, "false");
    } catch (err) {
      console.error("Failed to clear coordinates from localStorage:", err);
    }
  };

  const value: CoordinateContextType = {
    data,
    isLoading,
    hasCoordinates: !!data,
    formSubmitted,
    setCoordinateData,
    setFormSubmitted,
    clearCoordinateData,
  };

  return (
    <CoordinateContext.Provider value={value}>
      {children}
    </CoordinateContext.Provider>
  );
}

export function useCoordinates() {
  const context = useContext(CoordinateContext);
  if (!context) {
    throw new Error("useCoordinates must be used within a CoordinateProvider");
  }
  return context;
}
