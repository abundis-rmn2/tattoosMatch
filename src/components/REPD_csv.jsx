import React, { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import Papa from 'papaparse';
import repdData from '/src/csv/repd_tats_inferencia.csv';

const REPD_csv = ({ map, setMarkers }) => {
  useEffect(() => {
    if (!map) return;

    const markers = [];
    Papa.parse(repdData, {
      download: true,
      header: true,
      complete: (result) => {
        result.data.forEach((row) => {
          if (!row.lat_long || !row.lat_long.includes(',')) return; // Skip invalid rows
          const [lat, lng] = row.lat_long.split(',').map(Number);
          if (isNaN(lat) || isNaN(lng)) return; // Skip rows with invalid coordinates
          const marker = new maplibregl.Marker()
            .setLngLat([lng, lat])
            .setPopup(
              new maplibregl.Popup().setHTML(`
                <strong>Location:</strong> ${row.loc}<br />
                <strong>Date:</strong> ${row.fecha || 'N/A'}<br />
                <strong>Violence Terms:</strong> ${row.violence_terms || 'None'}
              `)
            )
            .addTo(map);
          markers.push(marker);
        });
        setMarkers((prev) => [...prev, ...markers]);
      },
    });

    return () => markers.forEach((marker) => marker.remove());
  }, [map, setMarkers]);

  return null;
};

export default REPD_csv;
