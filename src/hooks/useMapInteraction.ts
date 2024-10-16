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
      const deltaZoom = -event.deltaY * zoomSensitivity;
      const newZoom = zoom + deltaZoom;
      const clampedZoom = Math.max(config.minZoom, Math.min(config.maxZoom, newZoom));

      if (config.zoomCenter === 'mouse' && canvas) {
        // Get mouse position relative to the canvas
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Calculate the mouse position in map coordinates before zoom
        const scale = Math.pow(2, zoom);
        const mapX = center[0] + (mouseX - canvas.width / 2) / scale;
        const mapY = center[1] + (mouseY - canvas.height / 2) / scale;

        // Calculate the new scale
        const newScale = Math.pow(2, clampedZoom);

        // Calculate the new center to keep the mouse position fixed
        const newCenterX = mapX - (mouseX - canvas.width / 2) / newScale;
        const newCenterY = mapY - (mouseY - canvas.height / 2) / newScale;

        setCenter([newCenterX, newCenterY]);
      }

      setZoom(clampedZoom);
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
