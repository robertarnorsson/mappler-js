import React, { useEffect, useRef } from 'react';
import { useMapInteraction } from '../hooks/useMapInteraction';
import { useMap } from '../context/MapContext';
import { loadTileImage } from '../utils/TileLoader';

const Map: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { zoom, center } = useMapInteraction(canvasRef);
  const { config } = useMap();

  // Function to dynamically resize the canvas to fit its container
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas && canvas.parentElement) {
      // Set the canvas width and height to the parent container's dimensions
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    }
  };

  useEffect(() => {
    resizeCanvas(); // Resize canvas on mount
    window.addEventListener('resize', resizeCanvas); // Resize canvas on window resize
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tileSize = config.tileSize;
    const flooredZoom = Math.floor(zoom);
    const scale = Math.pow(2, zoom - flooredZoom); // Fractional zoom scale

    // Helper function: Convert pixel coordinates to tile coordinates at floored zoom level
    const pixelToTile = (pixelX: number, pixelY: number, zoom: number) => {
      const scale = Math.pow(2, zoom);
      const x = Math.floor(pixelX / (tileSize * scale));
      const y = Math.floor(pixelY / (tileSize * scale));
      return { x, y };
    };

    // Calculate how many tiles to render around the center
    const tilesX = Math.ceil(canvas.width / tileSize / 2);
    const tilesY = Math.ceil(canvas.height / tileSize / 2);

    // Convert the pixel-based center to tile coordinates
    const { x: centerTileX, y: centerTileY } = pixelToTile(center[0], center[1], flooredZoom);

    // Calculate fractional tile offset for smooth panning
    const offsetX = (center[0] / (tileSize * scale)) - centerTileX;
    const offsetY = (center[1] / (tileSize * scale)) - centerTileY;

    // Calculate tile bounds with a margin (load extra tiles around the canvas)
    const startTileX = Math.max(0, centerTileX - tilesX - 1);
    const endTileX = centerTileX + tilesX + 1;
    const startTileY = Math.max(0, centerTileY - tilesY - 1);
    const endTileY = centerTileY + tilesY + 1;

    const renderTiles = async () => {
      const tilePromises: Promise<void>[] = [];

      for (let x = startTileX; x <= endTileX; x++) {
        for (let y = startTileY; y <= endTileY; y++) {
          const posX = (x - centerTileX) * tileSize * scale + canvas.width / 2 - offsetX * tileSize * scale;
          const posY = (y - centerTileY) * tileSize * scale + canvas.height / 2 - offsetY * tileSize * scale;

          // Ensure tiles are within canvas or close to it (with a margin)
          const isWithinMargin = posX > -tileSize && posX < canvas.width + tileSize && posY > -tileSize && posY < canvas.height + tileSize;
          if (!isWithinMargin) continue;

          const promise = loadTileImage(x, y, flooredZoom, config.tileUrl).then((img: any) => {
            if (img) {
              ctx.drawImage(img, posX, posY, tileSize * scale, tileSize * scale);
            }
          });

          tilePromises.push(promise);
        }
      }

      await Promise.all(tilePromises);
    };

    renderTiles();
  }, [zoom, center, config]);

  return <canvas className='map' ref={canvasRef} />;
};

export default Map;
