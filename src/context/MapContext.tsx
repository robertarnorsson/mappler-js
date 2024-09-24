import React, { createContext, useState, useContext, ReactNode } from 'react';
import { MapConfig } from '../types/MapTypes';

interface MapContextType {
  zoom: number;
  center: [number, number];
  setZoom: (zoom: number) => void;
  setCenter: (center: [number, number]) => void;
  config: MapConfig;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: React.FC<{ config: MapConfig; children: ReactNode }> = ({ config, children }) => {
  const [zoom, setZoom] = useState(config.minZoom);
  const [center, setCenter] = useState<[number, number]>([0, 0]); // Initial center of the map

  return (
    <MapContext.Provider value={{ zoom, center, setZoom, setCenter, config }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = (): MapContextType => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};
