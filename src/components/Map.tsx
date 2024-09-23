import React from 'react';
import TileLayer from './TileLayer';
import { MapContextProvider } from '../context/MapContext';

type MapProps = {
  config: {
    tileUrl: string;
    initialZoom: number;
    initialCenter: [number, number];
    tileSize?: number;
  };
};

const Map: React.FC<MapProps> = ({ config }) => {
  if (!config.tileUrl || !config.initialCenter || !config.initialZoom) {
    return <div>Map configuration is incomplete</div>;
  }

  return (
    <MapContextProvider config={config}>
      <div className="map-container">
        <TileLayer />
      </div>
    </MapContextProvider>
  );
};

export default Map;
