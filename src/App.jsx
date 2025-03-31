import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import REPD_csv from './components/REPD_csv';
import PFSI_csv from './components/PFSI_csv';

const App = () => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (!mapContainer.current) return; // Ensure the container is available

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json', // Updated style URL
      center: [-103.3123, 20.6253],
      zoom: 8,
      maxZoom: 18 // Set maximum zoom level
    });

    mapInstance.scrollZoom.enable(); // Enable scroll zoom
    mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');
    setMap(mapInstance);

    return () => mapInstance.remove();
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <div
        ref={mapContainer}
        style={{
          height: '100vh', // Explicit height
          width: '100vw',  // Explicit width
          position: 'relative' // Ensure proper positioning
        }}
      />
      {map && (
        <>
          <REPD_csv map={map} />
          <PFSI_csv map={map} />
        </>
      )}
    </div>
  );
};

export default App;
