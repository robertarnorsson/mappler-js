import React, { createContext, useState, useMemo, ReactNode } from 'react';

type MapContextType = {
  zoom: number;
  center: [number, number];
  setZoom: (zoom: number) => void;
  setCenter: (center: [number, number]) => void;
  tileUrl: string;
  tileSize: number;
};

// We explicitly allow the context to be undefined at first
const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapContextProvider: React.FC<{ config: any; children: ReactNode }> = ({ config, children }) => {
  const { initialZoom, initialCenter, tileUrl, tileSize = 256 } = config;
  const [zoom, setZoom] = useState(initialZoom);
  const [center, setCenter] = useState(initialCenter);

  const value = useMemo(
    () => ({
      zoom,
      center,
      setZoom,
      setCenter,
      tileUrl,
      tileSize,
    }),
    [zoom, center, tileUrl, tileSize]
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

export const useMapContext = () => {
  const context = React.useContext(MapContext);

  if (!context) {
    throw new Error('useMapContext must be used within a MapContextProvider');
  }

  return context;
};

export { MapContext };
