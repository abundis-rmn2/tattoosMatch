import React, { useState } from 'react';

const LayerToggle = ({ repdMarkers, pfsiMarkers }) => {
  const [showREPD, setShowREPD] = useState(true);
  const [showPFSI, setShowPFSI] = useState(true);

  const toggleREPD = () => {
    setShowREPD((prev) => !prev);
    repdMarkers.forEach((marker) => {
      marker.getElement().style.display = showREPD ? 'none' : 'block';
    });
  };

  const togglePFSI = () => {
    setShowPFSI((prev) => !prev);
    pfsiMarkers.forEach((marker) => {
      marker.getElement().style.display = showPFSI ? 'none' : 'block';
    });
  };

  return (
    <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1, background: 'white', padding: '10px', borderRadius: '5px' }}>
      <label>
        <input type="checkbox" checked={showREPD} onChange={toggleREPD} />
        Show REPD Markers
      </label>
      <br />
      <label>
        <input type="checkbox" checked={showPFSI} onChange={togglePFSI} />
        Show PFSI Markers
      </label>
    </div>
  );
};

export default LayerToggle;
