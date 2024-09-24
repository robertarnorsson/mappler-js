import React, { useContext, useEffect, useRef, useState } from 'react';
import { MapContext } from '../context/MapContext';
import { calculateVisibleTiles } from '../utils/tileCalculations';

const TileLayer: React.FC = () => {
  const mapContext = useContext(MapContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startPos, setStartPos] = useState<[number, number] | null>(null);
  const [panOffset, setPanOffset] = useState<[number, number]>([0, 0]);

  if (!mapContext) {
    return <div>Loading map...</div>;
  }

  const { zoom, center, setCenter, tileUrl, tileSize, allowNegativeTiles } = mapContext;
  const mapWidth = window.innerWidth;
  const mapHeight = window.innerHeight;

  const tiles = calculateVisibleTiles(zoom, center, mapWidth, mapHeight, tileSize, allowNegativeTiles);

  // Draw tiles on canvas
  const drawTiles = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      tiles.forEach((tile) => {
        const url = tileUrl.replace('{z}', String(zoom)).replace('{x}', String(tile.x)).replace('{y}', String(tile.y));
        const img = new Image();
        img.src = url;

        img.onload = () => {
          const tileX = tile.x * tileSize + panOffset[0];
          const tileY = tile.y * tileSize + panOffset[1];
          ctx.drawImage(img, tileX, tileY, tileSize, tileSize);
        };

        img.onerror = () => {
          console.error(`Error loading tile: ${url}`);
        };
      });
    }
  };

  // Re-draw the tiles when tiles or zoom change
  useEffect(() => {
    drawTiles();
  }, [tiles, zoom, panOffset]);

  // Handle mouse down to start panning
  const handleMouseDown = (event: React.MouseEvent) => {
    setIsPanning(true);
    setStartPos([event.clientX, event.clientY]);
  };

  // Handle mouse movement to pan the map
  const handleMouseMove = (event: MouseEvent) => {
    if (isPanning && startPos) {
      const dx = event.clientX - startPos[0];
      const dy = event.clientY - startPos[1];

      setPanOffset([dx, dy]); // Update the pan offset
    }
  };

  // Stop panning and apply pan offset to the center of the map
  const handleMouseUp = () => {
    if (startPos) {
      const dx = panOffset[0];
      const dy = panOffset[1];

      // Calculate how far we moved in map coordinates (not pixels)
      const numTiles = Math.pow(2, zoom);
      const tileScale = tileSize / numTiles;

      const newCenterX = center[0] - dx / tileScale;
      const newCenterY = center[1] - dy / tileScale;

      // Update the map's center based on the panning
      setPanOffset([newCenterX, newCenterY]);
    }

    setIsPanning(false);
    setStartPos(null);
    setPanOffset([0, 0]); // Reset pan offset after panning
  };

  // Add and remove event listeners for mouse movement
  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning, startPos, center, zoom]);

  return (
    <canvas
      ref={canvasRef}
      width={mapWidth}
      height={mapHeight}
      style={{ position: 'absolute', top: panOffset[0], left: panOffset[1], cursor: isPanning ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
    />
  );
};

export default TileLayer;
