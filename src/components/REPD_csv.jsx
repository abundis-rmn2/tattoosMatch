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
        console.log(`Parsed ${result.data.length} rows from CSV file.`); // Log total rows parsed
        result.data.forEach((row, index) => {
          if (!row.lat_long || !row.lat_long.includes(',')) {
            console.warn(`Row ${index + 1} skipped: Invalid lat_long value.`); // Log skipped rows
            return;
          }
          const [lat, lng] = row.lat_long.split(',').map(Number);
          if (isNaN(lat) || isNaN(lng)) {
            console.warn(`Row ${index + 1} skipped: Invalid coordinates.`); // Log invalid coordinates
            return;
          }
          const marker = new maplibregl.Marker({
            element: document.createElement('div'),
          });
          marker.id = row.id_cedula_busqueda ? String(row.id_cedula_busqueda).trim().toLowerCase() : 'unknown'; // Normalize ID and handle null/undefined
          marker.getElement().style.backgroundColor = 'orange';
          marker.getElement().style.width = '12px';
          marker.getElement().style.height = '12px';
          marker.getElement().style.borderRadius = '50%';
          marker.getElement().style.border = '3px solid orange';
          marker.setLngLat([lng, lat])
            .setPopup(
              new maplibregl.Popup().setHTML(`
                <strong>ID:</strong> ${row.id_cedula_busqueda || 'N/A'}<br />
                <strong>Location:</strong> ${row.loc || 'N/A'}<br />
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
