import React, { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import Papa from 'papaparse';
import pfsiData from '/src/csv/pfsi_tats.csv';

const LOCATIONS = {
  'San PedroTlaquepaque': [20.6253, -103.3123],
  'Puerto Vallarta': [20.6432, -105.2335],
  'Colotlán': [21.2159, -103.1278],
  'Magdalena': [20.7683, -103.8333],
  'Tepatitlán de Morelos': [20.9333, -102.7333],
  'Lagos de Moreno': [21.2333, -102.2333],
  'Ciudad Guzmán': [19.8833, -103.3667],
  'El Grullo': [20.4333, -103.9667],
  'Ocotlán': [19.9833, -103.3667],
};

const PFSI_csv = ({ map, setMarkers }) => {
  useEffect(() => {
    if (!map) return;

    const markers = [];
    Papa.parse(pfsiData, {
      download: true,
      header: true,
      complete: (result) => {
        result.data
          .filter((row) => LOCATIONS[row.Delegacion_IJCF])
          .forEach((row) => {
            const position = LOCATIONS[row.Delegacion_IJCF];
            if (!position) return;
            const marker = new maplibregl.Marker()
              .setLngLat([position[1], position[0]])
              .setPopup(
                new maplibregl.Popup().setHTML(`
                  <strong>ID:</strong> ${row.ID || 'N/A'}<br />
                  <strong>Delegation:</strong> ${row.Delegacion_IJCF || 'N/A'}<br />
                  <strong>Tattoos:</strong> ${row.Tatuajes || 'N/A'}
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

export default PFSI_csv;
