export type MapConfig = {
  tileUrl: string;
  tileSize: number;
  minZoom: number;
  maxZoom: number;
  zoomCenter?: 'mouse' | 'screen';
};


export type MapProps = {
  config: MapConfig;
};