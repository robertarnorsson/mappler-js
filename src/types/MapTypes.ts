export type MapConfig = {
  tileUrl: string;
  initialZoom: number;
  initialCenter: [number, number];
  tileSize?: number;
  allowNegativeTiles?: boolean;
  minZoom?: number;
  maxZoom?: number;
  bounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
};


export type MapProps = {
  config: MapConfig;
};