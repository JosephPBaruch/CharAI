import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { FeatureCollection } from 'geojson';

const STORAGE_KEY = 'charai_coordinate_data';

interface CoordinateContextType {
  data: FeatureCollection | null;
  isLoading: boolean;
  hasCoordinates: boolean;
  setCoordinateData: (data: FeatureCollection) => void;
  clearCoordinateData: () => void;
}

const CoordinateContext = createContext<CoordinateContextType | undefined>(undefined);

export function CoordinateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, load coordinate data from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (err) {
      console.debug('Failed to load coordinates from localStorage:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setCoordinateData = (newData: FeatureCollection) => {
    setData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch (err) {
      console.error('Failed to save coordinates to localStorage:', err);
    }
  };

  const clearCoordinateData = () => {
    setData(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear coordinates from localStorage:', err);
    }
  };

  const value: CoordinateContextType = {
    data,
    isLoading,
    hasCoordinates: !!data,
    setCoordinateData,
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
