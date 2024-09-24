/**
 * Calculates the center of the map based on its width and height.
 * @param mapWidth - The width of the map in pixels.
 * @param mapHeight - The height of the map in pixels.
 * @param tileSize - The size of each tile in pixels (optional, default 256).
 * @returns [x, y] - The calculated center of the map.
 */
export const getCenter = (mapWidth: number, mapHeight: number, tileSize: number = 256): [number, number] => {
  // Calculate the center of the map based on its width and height
  const centerX = (mapWidth / tileSize) / 2;
  const centerY = (mapHeight / tileSize) / 2;

  return [centerX, centerY];
};
