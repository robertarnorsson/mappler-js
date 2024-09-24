import React, { createContext, useState, useMemo, ReactNode } from 'react';
import { MapConfig } from '../types/MapTypes';

type MapContextType = {
  zoom: number;
  setZoom: (newZoom: number) => void;
  center: [number, number];
  setCenter: (newCenter: [number, number]) => void;
  panOffset: [number, number];
  setPanOffset: (newOffset: [number, number]) => void;
  tileUrl: string;
  tileSize: number;
  allowNegativeTiles: boolean;
  bounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
};

// We explicitly allow the context to be undefined at first
const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapContextProvider: React.FC<{ config: MapConfig; children: ReactNode }> = ({ config, children }) => {
  const { initialZoom, initialCenter, tileUrl, tileSize = 256, allowNegativeTiles = true, bounds, minZoom = 0, maxZoom = 18 } = config;
  const [zoom, setZoom] = useState(initialZoom);
  const [center, setCenter] = useState<[number, number]>(initialCenter);
  const [panOffset, setPanOffset] = useState<[number, number]>([0, 0]);

  // Handle Zoom changes with limits
  const handleZoomChange = (newZoom: number) => {
    if (newZoom >= minZoom && newZoom <= maxZoom) {
      setZoom(newZoom);
    }
  };

  // Handle Pan changes with limits
  const handlePan = (newCenter: [number, number]) => {
    if (bounds) {
      const numTiles = Math.pow(2, zoom);
      const newTileX = newCenter[0] * numTiles;
      const newTileY = newCenter[1] * numTiles;

      const clampedX = Math.max(bounds.minX, Math.min(bounds.maxX, newTileX)) / numTiles;
      const clampedY = Math.max(bounds.minY, Math.min(bounds.maxY, newTileY)) / numTiles;

      setCenter([clampedX, clampedY]);
      setPanOffset([clampedX, clampedY]);
    } else {
      setCenter(newCenter);
    }
  };

  return (
    <MapContext.Provider value={{ zoom, setZoom: handleZoomChange, center, setCenter: handlePan, panOffset, setPanOffset: handlePan, tileUrl, tileSize, allowNegativeTiles, bounds }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = React.useContext(MapContext);

  if (!context) {
    throw new Error('useMapContext must be used within a MapContextProvider');
  }

  return context;
};

export { MapContext };
