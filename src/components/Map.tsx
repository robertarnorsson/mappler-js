import React, { useEffect, useRef, useState } from 'react';
import { useMapInteraction } from '../hooks/useMapInteraction';
import { useMap } from '../context/MapContext';
import { loadTileImage } from '../utils/TileLoader';

let renderId = 0; // Global render ID to track rendering cycles

const Map: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { zoom, center } = useMapInteraction(canvasRef);
  const { config } = useMap();

  // State to track canvas size
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  
  const previousZoomRef = useRef<number>(zoom);
  const previousCenterRef = useRef<[number, number]>(center);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas && canvas.parentElement) {
      const parentWidth = canvas.parentElement.clientWidth;
      const parentHeight = canvas.parentElement.clientHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = parentWidth * dpr;
      canvas.height = parentHeight * dpr;

      canvas.style.width = `${parentWidth}px`;
      canvas.style.height = `${parentHeight}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = false;
      }

      // Update canvasSize state
      setCanvasSize({ width: canvas.width, height: canvas.height });
    }
  };

  useEffect(() => {
    resizeCanvas(); // Resize canvas on mount
    window.addEventListener('resize', resizeCanvas); // Resize canvas on window resize
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Increment the render ID
    const currentRenderId = ++renderId;

    const render = () => {
      if (currentRenderId !== renderId) return; // Outdated render, abort

      ctx.imageSmoothingEnabled = false;

      // Clear the canvas at the start of the render cycle
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const tileSize = config.tileSize;

      // Calculate the tile zoom level (integer), ensuring it doesn't exceed maxZoom
      const tileZoomLevel = Math.min(Math.ceil(zoom), config.maxZoom);

      // Calculate the scale factor for rendering tiles
      const tileScale = Math.pow(2, zoom - tileZoomLevel);

      const numTiles = Math.pow(2, tileZoomLevel);

      const scale = Math.pow(2, zoom);

      // Convert center coordinates to pixel coordinates at the current zoom level
      const centerX = center[0] * scale;
      const centerY = center[1] * scale;

      const halfCanvasWidth = canvas.width / 2;
      const halfCanvasHeight = canvas.height / 2;

      // Top-left corner in pixel coordinates at the current zoom level
      const topLeftX = centerX - halfCanvasWidth;
      const topLeftY = centerY - halfCanvasHeight;

      // Calculate the range of tiles to render
      const startTileX = Math.floor(topLeftX / (tileSize * tileScale));
      const endTileX = Math.floor((topLeftX + canvas.width) / (tileSize * tileScale));
      const startTileY = Math.floor(topLeftY / (tileSize * tileScale));
      const endTileY = Math.floor((topLeftY + canvas.height) / (tileSize * tileScale));

      // Calculate the maximum valid tile index for the current tile zoom level
      const maxTileIndex = numTiles - 1;

      // Collect tile coordinates
      const tileCoords: { x: number; y: number }[] = [];

      for (let x = startTileX; x <= endTileX; x++) {
        if (x < 0 || x > maxTileIndex) continue;

        for (let y = startTileY; y <= endTileY; y++) {
          if (y < 0 || y > maxTileIndex) continue;

          tileCoords.push({ x, y });
        }
      }

      tileCoords.sort((a, b) => {
        const distA = Math.hypot(a.x - (centerX / tileSize), a.y - (centerY / tileSize));
        const distB = Math.hypot(b.x - (centerX / tileSize), b.y - (centerY / tileSize));
        return distA - distB;
      });

      // Function to get the best available tile image from cache
      const getBestTileImage = (x: number, y: number, z: number): { img: HTMLImageElement; tileX: number; tileY: number; tileZ: number } | null => {
        let currentX = x;
        let currentY = y;
        let currentZ = z;
        while (currentZ >= config.minZoom) {
          const tileKey = `${currentZ}/${currentX}/${currentY}`;
          const img = loadTileImage.cache.get(tileKey);
          if (img) {
            return { img, tileX: currentX, tileY: currentY, tileZ: currentZ };
          }
          // Move to parent tile
          currentX = Math.floor(currentX / 2);
          currentY = Math.floor(currentY / 2);
          currentZ -= 1;
        }
        return null;
      };

      const renderTiles = () => {
        for (const { x, y } of tileCoords) {
          const tilePosX = Math.floor((x * tileSize * tileScale) - topLeftX);
          const tilePosY = Math.floor((y * tileSize * tileScale) - topLeftY);
          const tileWidth = Math.ceil(tileSize * tileScale) + 1;
          const tileHeight = Math.ceil(tileSize * tileScale) + 1;

          // Try to get the best tile image from cache
          const bestTile = getBestTileImage(x, y, tileZoomLevel);
          if (bestTile) {
            const { img, tileX: imgX, tileY: imgY, tileZ: imgZ } = bestTile;

            const zoomDiff = tileZoomLevel - imgZ;
            const scaleMultiplier = Math.pow(2, zoomDiff);

            const adjustedTileSize = tileSize * tileScale * scaleMultiplier;

            const adjustedTilePosX = Math.floor((imgX * adjustedTileSize) - topLeftX);
            const adjustedTilePosY = Math.floor((imgY * adjustedTileSize) - topLeftY);

            ctx.drawImage(
              img,
              adjustedTilePosX,
              adjustedTilePosY,
              adjustedTileSize,
              adjustedTileSize
            );
          }

          // Load the tile image asynchronously
          loadTileImage(x, y, tileZoomLevel, config.tileUrl)
            .then((img) => {
              if (img && currentRenderId === renderId) {
                ctx.drawImage(img, tilePosX, tilePosY, tileWidth, tileHeight);
              }
            })
            .catch((error) => {
              // Handle errors if necessary
            });
        }
      };

      renderTiles();
    };

    requestAnimationFrame(render);

    // Update previous zoom level and center
    previousZoomRef.current = zoom;
    previousCenterRef.current = center;

    return () => {
      renderId++;
    };
  }, [zoom, center, config, canvasSize]);

  return <canvas className='map' ref={canvasRef} />;
};

export default Map;