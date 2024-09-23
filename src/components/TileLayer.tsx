import React, { useContext } from 'react';
import Tile from './Tile';
import { MapContext } from '../context/MapContext';
import { calculateVisibleTiles } from '../utils/tileCalculations';

const TileLayer: React.FC = () => {
  const mapContext = useContext(MapContext);

  if (!mapContext) {
    return <div>Loading map...</div>;
  }

  const { zoom, center, tileUrl, tileSize } = mapContext;
  const tiles = calculateVisibleTiles(zoom, center);

  return (
    <div className="tile-layer">
      {tiles.map((tile) => (
        <Tile
          key={`${tile.x}-${tile.y}`}
          tileUrl={tileUrl}
          zoom={zoom}
          x={tile.x}
          y={tile.y}
          tileSize={tileSize}
        />
      ))}
    </div>
  );
};

export default TileLayer;
