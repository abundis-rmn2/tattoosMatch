import React, { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import Papa from 'papaparse';
import repdData from '/src/csv/repd_tats_inferencia.csv';

const REPD_csv = ({ map }) => {
  useEffect(() => {
    if (!map) return;

    // Parse CSV data
    Papa.parse(repdData, {
      download: true,
      header: true,
      complete: (result) => {
        result.data.forEach((row) => {
          if (!row.lat_long || !row.lat_long.includes(',')) return; // Skip invalid rows
          const [lat, lng] = row.lat_long.split(',').map(Number);
          if (isNaN(lat) || isNaN(lng)) return; // Skip rows with invalid coordinates
          new maplibregl.Marker()
            .setLngLat([lng, lat])
            .setPopup(
              new maplibregl.Popup().setHTML(`
                <strong>Location:</strong> ${row.loc}<br />
                <strong>Date:</strong> ${row.fecha || 'N/A'}<br />
                <strong>Violence Terms:</strong> ${row.violence_terms || 'None'}
              `)
            )
            .addTo(map);
        });
      },
    });
  }, [map]);

  return null;
};

export default REPD_csv;
