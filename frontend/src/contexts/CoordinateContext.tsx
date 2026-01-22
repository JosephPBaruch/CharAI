import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { FeatureCollection } from "geojson";

const STORAGE_KEY = "charai_coordinate_data"; // committed/approved coordinates
const PENDING_STORAGE_KEY = "charai_coordinate_pending"; // latest user input (manual or upload) before submit
const SUBMIT_STORAGE_KEY = "charai_farm_submitted";

type LatLng = { lat: number; lng: number };

interface CoordinateContextType {
  data: FeatureCollection | null;
  pendingData: FeatureCollection | null;
  isLoading: boolean;
  hasCoordinates: boolean;
  hasPendingCoordinates: boolean;
  formSubmitted: boolean;
  setCoordinateData: (data: FeatureCollection | LatLng[]) => void; // accepts GeoJSON or raw lat/lng array
  commitPendingCoordinates: () => void; // promote pending -> committed and mark submitted
  setFormSubmitted: (submitted: boolean) => void;
  clearCoordinateData: () => void;
}

const CoordinateContext = createContext<CoordinateContextType | undefined>(
  undefined,
);

export function CoordinateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FeatureCollection | null>(null);
  const [pendingData, setPendingData] = useState<FeatureCollection | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [formSubmitted, setFormSubmittedState] = useState<boolean>(false);

  // Helper: convert [{lat,lng}, ...] to a closed GeoJSON FeatureCollection with temporary default properties
  const coordsToFeatureCollection = (
    coords: LatLng[],
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

  // On mount, load coordinate data from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setData(JSON.parse(stored));
      }

      const storedPending = localStorage.getItem(PENDING_STORAGE_KEY);
      if (storedPending) {
        setPendingData(JSON.parse(storedPending));
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

  const setCoordinateData = (newData: FeatureCollection | LatLng[]) => {
    let fc: FeatureCollection | null = null;
    if (Array.isArray(newData)) {
      fc = coordsToFeatureCollection(newData);
    } else {
      fc = newData;
    }
    if (!fc) return;
    setPendingData(fc);
    try {
      localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(fc));
    } catch (err) {
      console.error("Failed to save pending coordinates to localStorage:", err);
    }
  };

  const commitPendingCoordinates = () => {
    if (!pendingData) return;
    // Ensure temporary default properties exist for hover purposes
    const committed: FeatureCollection = {
      type: "FeatureCollection",
      features: pendingData.features.map((f) => ({
        ...f,
        properties: {
          applicationRate: f.properties?.applicationRate ?? 5,
          paybackPeriod: f.properties?.paybackPeriod ?? 3,
          ...f.properties,
        },
      })),
    };

    console.log(
      "Committed Coordinates GeoJSON:",
      JSON.stringify(committed, null, 2),
    );

    setData(committed);
    setFormSubmittedState(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(committed));
      localStorage.setItem(SUBMIT_STORAGE_KEY, "true");
    } catch (err) {
      console.error("Failed to commit coordinates to localStorage:", err);
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
    setPendingData(null);
    setFormSubmittedState(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PENDING_STORAGE_KEY);
      localStorage.setItem(SUBMIT_STORAGE_KEY, "false");
    } catch (err) {
      console.error("Failed to clear coordinates from localStorage:", err);
    }
  };

  const value: CoordinateContextType = {
    data,
    pendingData,
    isLoading,
    hasCoordinates: !!data,
    hasPendingCoordinates: !!pendingData,
    formSubmitted,
    setCoordinateData,
    commitPendingCoordinates,
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
