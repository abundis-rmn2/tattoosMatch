import React, { useState } from 'react';

const LayerToggle = ({ repdMarkers, pfsiMarkers, map }) => {
  const [showREPD, setShowREPD] = useState(true);
  const [showPFSI, setShowPFSI] = useState(true);
  const [showEdges, setShowEdges] = useState(true); // State for edges visibility

  const toggleREPD = () => {
    setShowREPD((prev) => !prev);
    repdMarkers.forEach((marker) => {
      marker.getElement().style.display = showREPD ? 'none' : 'block';
    });
    console.log(`REPD markers are now ${showREPD ? 'hidden' : 'visible'}`);
  };

  const togglePFSI = () => {
    setShowPFSI((prev) => !prev);
    pfsiMarkers.forEach((marker) => {
      marker.getElement().style.display = showPFSI ? 'none' : 'block';
    });
    console.log(`PFSI markers are now ${showPFSI ? 'hidden' : 'visible'}`);
  };

  const toggleEdges = () => {
    setShowEdges((prev) => !prev);
    if (map) {
      const visibility = showEdges ? 'none' : 'visible';
      if (map.getLayer('edges-line-layer')) {
        map.setLayoutProperty('edges-line-layer', 'visibility', visibility); // Toggle line visibility
        console.log(`Edges line layer visibility set to ${visibility}`);
      } else {
        console.warn('edges-line-layer not found in the map');
      }
      if (map.getLayer('edges-text-layer')) {
        map.setLayoutProperty('edges-text-layer', 'visibility', visibility); // Toggle text visibility
        console.log(`Edges text layer visibility set to ${visibility}`);
      } else {
        console.warn('edges-text-layer not found in the map');
      }
    }
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
      <br />
      <label>
        <input type="checkbox" checked={showEdges} onChange={toggleEdges} />
        Show Text
      </label>
    </div>
  );
};

export default LayerToggle;
