export const calculateVisibleTiles = (
  zoom: number,
  center: [number, number],
  mapWidth: number,
  mapHeight: number,
  tileSize: number,
  allowNegativeTiles: boolean = true
) => {
  const numTiles = Math.pow(2, zoom); // Total number of tiles along one axis
  const centerTileX = Math.floor(center[0] * numTiles);
  const centerTileY = Math.floor(center[1] * numTiles);

  // Calculate how many tiles are needed to cover the width and height of the map
  const tilesHorizontally = Math.ceil(mapWidth / tileSize) + 1; // Add 1 extra tile for padding
  const tilesVertically = Math.ceil(mapHeight / tileSize) + 1; // Add 1 extra tile for padding

  const tiles = [];

  // Calculate the visible tile range
  const minX = Math.max(0, centerTileX - Math.floor(tilesHorizontally / 2));
  const maxX = Math.min(numTiles - 1, centerTileX + Math.floor(tilesHorizontally / 2));
  const minY = Math.max(0, centerTileY - Math.floor(tilesVertically / 2));
  const maxY = Math.min(numTiles - 1, centerTileY + Math.floor(tilesVertically / 2));

  // Generate the list of visible tiles
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      if (allowNegativeTiles || (x >= 0 && y >= 0)) {
        tiles.push({ x, y });
      }
    }
  }

  return tiles;
};
