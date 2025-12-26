import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { FeatureCollection } from 'geojson';

const STORAGE_KEY = 'charai_coordinate_data'; // committed/approved coordinates
const PENDING_STORAGE_KEY = 'charai_coordinate_pending'; // latest user input (manual or upload) before submit
const SUBMIT_STORAGE_KEY = 'charai_farm_submitted';

interface CoordinateContextType {
  data: FeatureCollection | null;
  pendingData: FeatureCollection | null;
  isLoading: boolean;
  hasCoordinates: boolean;
  hasPendingCoordinates: boolean;
  formSubmitted: boolean;
  setCoordinateData: (data: FeatureCollection) => void; // sets pending draft coords
  commitPendingCoordinates: () => void; // promote pending -> committed and mark submitted
  setFormSubmitted: (submitted: boolean) => void;
  clearCoordinateData: () => void;
}

const CoordinateContext = createContext<CoordinateContextType | undefined>(undefined);

export function CoordinateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FeatureCollection | null>(null);
  const [pendingData, setPendingData] = useState<FeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formSubmitted, setFormSubmittedState] = useState<boolean>(false);

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
        setFormSubmittedState(storedSubmitted === 'true');
      }
    } catch (err) {
      console.debug('Failed to load coordinates from localStorage:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setCoordinateData = (newData: FeatureCollection) => {
    setPendingData(newData);
    try {
      localStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(newData));
    } catch (err) {
      console.error('Failed to save pending coordinates to localStorage:', err);
    }
  };

  const commitPendingCoordinates = () => {
    if (!pendingData) return;
    setData(pendingData);
    setFormSubmittedState(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingData));
      localStorage.setItem(SUBMIT_STORAGE_KEY, 'true');
    } catch (err) {
      console.error('Failed to commit coordinates to localStorage:', err);
    }
  };

  const setFormSubmitted = (submitted: boolean) => {
    setFormSubmittedState(submitted);
    try {
      localStorage.setItem(SUBMIT_STORAGE_KEY, submitted ? 'true' : 'false');
    } catch (err) {
      console.error('Failed to save submission flag to localStorage:', err);
    }
  };

  const clearCoordinateData = () => {
    setData(null);
    setPendingData(null);
    setFormSubmittedState(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PENDING_STORAGE_KEY);
      localStorage.setItem(SUBMIT_STORAGE_KEY, 'false');
    } catch (err) {
      console.error('Failed to clear coordinates from localStorage:', err);
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
    throw new Error('useCoordinates must be used within a CoordinateProvider');
  }
  return context;
}
