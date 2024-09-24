import React, { useContext } from 'react';
import { MapContext } from '../context/MapContext';
import '../styles/mapControls.css';

const MapControls: React.FC = () => {
  const mapContext = useContext(MapContext);

  if (!mapContext) {
    return null;
  }

  const { zoom, setZoom } = mapContext;

  const zoomIn = () => setZoom(zoom + 1);
  const zoomOut = () => setZoom(zoom - 1);

  return (
    <div className="map-controls">
      <button onClick={zoomIn}>Zoom In</button>
      <button onClick={zoomOut}>Zoom Out</button>
    </div>
  );
};

export default MapControls;