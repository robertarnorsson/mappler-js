import { useEffect, useRef } from 'react';
import { useMap } from '../context/MapContext';

export const useMapInteraction = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const { zoom, center, setZoom, setCenter, config } = useMap();
  const isDragging = useRef(false);
  const dragStart = useRef<[number, number]>([0, 0]);
  const lastCenter = useRef<[number, number]>(center);

  useEffect(() => {
    const canvas = canvasRef.current;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const zoomSensitivity = 0.001;
      const newZoom = zoom - event.deltaY * zoomSensitivity;
      console.log(newZoom);
      setZoom(Math.max(config.minZoom, Math.min(config.maxZoom, newZoom)));
    };

    const handleMouseDown = (event: MouseEvent) => {
      isDragging.current = true;
      dragStart.current = [event.clientX, event.clientY];
      lastCenter.current = center;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging.current) {
        const dx = event.clientX - dragStart.current[0];
        const dy = event.clientY - dragStart.current[1];

        const scale = Math.pow(2, zoom);
        const newCenter: [number, number] = [
          lastCenter.current[0] - dx / scale,
          lastCenter.current[1] - dy / scale,
        ];

        setCenter(newCenter);
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    if (canvas) {
      canvas.addEventListener('wheel', handleWheel);
      canvas.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
        canvas.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [zoom, center, setZoom, setCenter, config, canvasRef]);

  return { zoom, center };
};
