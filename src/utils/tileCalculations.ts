export const calculateVisibleTiles = (zoom: number, center: [number, number]) => {
    const numTiles = Math.pow(2, zoom);
    const centerTileX = Math.floor(center[0] * numTiles);
    const centerTileY = Math.floor(center[1] * numTiles);
  
    const tiles = [];
    for (let x = centerTileX - 1; x <= centerTileX + 1; x++) {
      for (let y = centerTileY - 1; y <= centerTileY + 1; y++) {
        tiles.push({ x, y });
      }
    }
  
    return tiles;
  };
  