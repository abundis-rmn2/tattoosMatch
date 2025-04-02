import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import REPD_csv from './components/REPD_csv';
import PFSI_csv from './components/PFSI_csv';
import Edges_csv from './components/Edges_csv'; // Import Edges_csv
import './App.css';

const App = () => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [repdMarkers, setRepdMarkers] = useState([]);
  const [pfsiMarkers, setPfsiMarkers] = useState([]);
  const [repdData, setRepdData] = useState({}); // Shared state for REPD data
  const [pfsiData, setPfsiData] = useState({}); // Shared state for PFSI data
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state
  const [password, setPassword] = useState(''); // Password input state
  const [error, setError] = useState(''); // Error message state

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous error

    try {
      const response = await fetch('https://tatuajes.abundis.com.mx/check_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (result.success) {
        setIsAuthenticated(true);
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch (error) {
      console.error('Error checking password:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !isAuthenticated) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [-105.3123, 20.6253],
      zoom: 7,
      maxZoom: 7,
      minZoom: 7,
      interactive: false, // Disable all user interactions
    });

    mapInstance.scrollZoom.enable();
    mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');
    setMap(mapInstance);

    return () => mapInstance.remove();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <form onSubmit={handlePasswordSubmit} style={{ textAlign: 'center' }}>
          <h1>Enter Password</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{ padding: '10px', fontSize: '16px', marginBottom: '10px', width: '200px' }}
          />
          <br />
          <button type="submit" style={{ padding: '10px 20px', fontSize: '16px' }}>Submit</button>
        </form>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </div>
    );
  }

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
          <REPD_csv map={map} setMarkers={setRepdMarkers} setRepdData={setRepdData} />
          <PFSI_csv map={map} setMarkers={setPfsiMarkers} setPfsiData={setPfsiData} />
          <Edges_csv
            map={map}
            repdMarkers={repdMarkers}
            pfsiMarkers={pfsiMarkers}
            repdData={repdData}
            pfsiData={pfsiData} // Pass pfsiData to Edges_csv
          />
        </>
      )}
    </div>
  );
};

export default App;
