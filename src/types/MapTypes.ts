export type MapConfig = {
  tileUrl: string;
  tileSize: number;
  minZoom: number;
  maxZoom: number;
}


export type MapProps = {
  config: MapConfig;
};