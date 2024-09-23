import React from 'react';

type TileProps = {
  tileUrl: string;
  zoom: number;
  x: number;
  y: number;
  tileSize: number;
};

const Tile: React.FC<TileProps> = ({ tileUrl, zoom, x, y, tileSize }) => {
  const url = tileUrl.replace('{z}', String(zoom)).replace('{x}', String(x)).replace('{y}', String(y));

  return (
    <img
      src={url}
      alt={`Tile ${x}-${y}`}
      style={{
        position: 'absolute',
        width: tileSize,
        height: tileSize,
        left: x * tileSize,
        top: y * tileSize,
      }}
    />
  );
};

export default Tile;
