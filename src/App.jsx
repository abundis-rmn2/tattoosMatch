import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import REPD_csv from './components/REPD_csv';
import PFSI_csv from './components/PFSI_csv';
import LayerToggle from './components/LayerToggle';

const App = () => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [repdMarkers, setRepdMarkers] = useState([]);
  const [pfsiMarkers, setPfsiMarkers] = useState([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [-103.3123, 20.6253],
      zoom: 8,
      maxZoom: 18,
    });

    mapInstance.scrollZoom.enable();
    mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');
    setMap(mapInstance);

    return () => mapInstance.remove();
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <div
        ref={mapContainer}
        style={{
          height: '100vh',
          width: '100vw',
          position: 'relative',
        }}
      />
      {map && (
        <>
          <REPD_csv map={map} setMarkers={setRepdMarkers} />
          <PFSI_csv map={map} setMarkers={setPfsiMarkers} />
          <LayerToggle map={map} repdMarkers={repdMarkers} pfsiMarkers={pfsiMarkers} />
        </>
      )}
    </div>
  );
};

export default App;
