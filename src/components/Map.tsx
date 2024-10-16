import React, { useEffect, useRef } from 'react';
import { useMapInteraction } from '../hooks/useMapInteraction';
import { useMap } from '../context/MapContext';
import { loadTileImage } from '../utils/TileLoader';

const Map: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { zoom, center } = useMapInteraction(canvasRef);
  const { config } = useMap();

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas && canvas.parentElement) {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    }
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tileSize = config.tileSize;
    const scale = Math.pow(2, zoom);

    const centerX = center[0];
    const centerY = center[1];

    const halfCanvasWidth = canvas.width / 2;
    const halfCanvasHeight = canvas.height / 2;
    const topLeftX = centerX - halfCanvasWidth / scale;
    const topLeftY = centerY - halfCanvasHeight / scale;

    const startTileX = Math.floor(topLeftX / tileSize);
    const endTileX = Math.floor((topLeftX + canvas.width / scale) / tileSize);
    const startTileY = Math.floor(topLeftY / tileSize);
    const endTileY = Math.floor((topLeftY + canvas.height / scale) / tileSize);

    const renderTiles = async () => {
      const tilePromises: Promise<void>[] = [];

      for (let x = startTileX; x <= endTileX; x++) {
        for (let y = startTileY; y <= endTileY; y++) {
          if (x < 0 || y < 0) continue;

          const tileX = x * tileSize;
          const tileY = y * tileSize;

          const posX = (tileX - topLeftX) * scale;
          const posY = (tileY - topLeftY) * scale;

          const promise = loadTileImage(x, y, Math.floor(zoom), config.tileUrl).then((img: any) => {
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
