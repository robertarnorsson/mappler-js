import { useContext } from 'react';
import { MapContext } from '../context/MapContext';

const useMap = () => {
  const context = useContext(MapContext);

  if (!context) {
      throw new Error('useMap must be used within a MapContextProvider');
  }

  const { zoom, setZoom, center, setCenter } = context;

  const zoomIn = () => setZoom(zoom + 1);
  const zoomOut = () => setZoom(zoom - 1);
  
  const panTo = (newCenter: [number, number]) => setCenter(newCenter);

  return { zoom, center, zoomIn, zoomOut, panTo };
};

export default useMap;
