import React from 'react';
import { MapContextProvider } from '../context/MapContext';
import { MapProps } from '../types/MapTypes';
import '../styles/map.css';

const Map: React.FC<MapProps & { children: React.ReactNode }> = ({ config, children }) => {
  if (config.tileUrl === undefined || config.initialCenter === undefined || config.initialZoom === undefined) {
    return <div>Map configuration is incomplete</div>;
  }

  return (
    <MapContextProvider config={config}>
      <div className="map-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
        {children}
      </div>
    </MapContextProvider>
  );
};

export default Map;
