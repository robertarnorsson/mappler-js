const tileCache = new Map<string, HTMLImageElement>();

// Function to load a tile image and cache it
export const loadTileImage = async (x: number, y: number, zoom: number, tileUrlTemplate: string): Promise<HTMLImageElement | undefined> => {
  const tileKey = `${zoom}/${x}/${y}`;
  if (tileCache.has(tileKey)) {
    return tileCache.get(tileKey);
  }

  const tileUrl = tileUrlTemplate
    .replace('{z}', zoom.toString())
    .replace('{x}', x.toString())
    .replace('{y}', y.toString());

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = tileUrl;
    img.onload = () => {
      tileCache.set(tileKey, img);
      resolve(img);
    };
    img.onerror = reject;
  });
};
