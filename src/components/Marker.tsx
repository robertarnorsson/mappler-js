import React from 'react';

type MarkerProps = {
  position: [number, number];  // X, Y coordinates
  label?: string;
};

const Marker: React.FC<MarkerProps> = ({ position, label }) => {
  const [x, y] = position;

  return (
    <div
      className="marker"
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {label && <span className="marker-label">{label}</span>}
    </div>
  );
};

export default Marker;
