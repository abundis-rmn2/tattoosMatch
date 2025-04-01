import React, { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import Papa from 'papaparse';
import repdData from '/src/csv/repd_tats_inferencia.csv';
import repdPrincipalData from '/src/csv/repd_principal_tats.csv'; // Import the new CSV file

const REPD_csv = ({ map, setMarkers }) => {
  useEffect(() => {
    if (!map) return;

    const markers = [];
    const markerProperties = {};

    // Parse the additional CSV file for marker properties
    Papa.parse(repdPrincipalData, {
      download: true,
      header: true,
      complete: (result) => {
        result.data.forEach((row) => {
          if (row.id_cedula_busqueda) {
            markerProperties[row.id_cedula_busqueda.trim().toLowerCase()] = row;
          }
        });
      },
    });

    // Parse the main CSV file and create markers
    Papa.parse(repdData, {
      download: true,
      header: true,
      complete: (result) => {
        console.log(result.data);
        result.data.forEach((row, index) => {
          if (!row.lat_long || !row.lat_long.includes(',')) {
            console.warn(`Row ${index + 1} skipped: Invalid lat_long value.`);
            return;
          }
          const [lat, lng] = row.lat_long.split(',').map(Number);
          if (isNaN(lat) || isNaN(lng)) {
            console.warn(`Row ${index + 1} skipped: Invalid coordinates.`);
            return;
          }

          const markerId = row.id_cedula_busqueda ? String(row.id_cedula_busqueda).trim().toLowerCase() : 'unknown';
          const properties = markerProperties[markerId] || {};

          const marker = new maplibregl.Marker({
            element: document.createElement('div'),
          });
          marker.id = markerId;

          // Add row properties to the marker object
          marker.properties = {
            id_cedula_busqueda: properties.id_cedula_busqueda || null,
            autorizacion_informacion_publica: properties.autorizacion_informacion_publica || null,
            condicion_localizacion: properties.condicion_localizacion || null,
            nombre_completo: properties.nombre_completo || null,
            edad_momento_desaparicion: properties.edad_momento_desaparicion || null,
            sexo: properties.sexo || null,
            genero: properties.genero || null,
            complexion: properties.complexion || null,
            estatura: properties.estatura || null,
            tez: properties.tez || null,
            cabello: properties.cabello || null,
            ojos_color: properties.ojos_color || null,
            municipio: properties.municipio || null,
            estado: properties.estado || null,
            fecha_desaparicion: properties.fecha_desaparicion || null,
            estatus_persona_desaparecida: properties.estatus_persona_desaparecida || null,
          };

          marker.getElement().style.backgroundColor = 'orange';
          marker.getElement().style.width = '12px';
          marker.getElement().style.height = '12px';
          marker.getElement().style.borderRadius = '50%';
          marker.getElement().style.border = '3px solid orange';
          marker.setLngLat([lng, lat])
            .setPopup(
              new maplibregl.Popup().setHTML(`
                <strong>ID:</strong> ${marker.properties.id_cedula_busqueda || 'N/A'}<br />
                <strong>Nombre:</strong> ${marker.properties.nombre_completo || 'N/A'}<br />
                <strong>Edad:</strong> ${marker.properties.edad_momento_desaparicion || 'N/A'}<br />
                <strong>Sexo:</strong> ${marker.properties.sexo || 'N/A'}<br />
                <strong>Género:</strong> ${marker.properties.genero || 'N/A'}<br />
                <strong>Complexión:</strong> ${marker.properties.complexion || 'N/A'}<br />
                <strong>Estatura:</strong> ${marker.properties.estatura || 'N/A'}<br />
                <strong>Tez:</strong> ${marker.properties.tez || 'N/A'}<br />
                <strong>Cabello:</strong> ${marker.properties.cabello || 'N/A'}<br />
                <strong>Ojos:</strong> ${marker.properties.ojos_color || 'N/A'}<br />
                <strong>Municipio:</strong> ${marker.properties.municipio || 'N/A'}<br />
                <strong>Estado:</strong> ${marker.properties.estado || 'N/A'}<br />
                <strong>Fecha Desaparición:</strong> ${marker.properties.fecha_desaparicion || 'N/A'}<br />
                <strong>Estatus:</strong> ${marker.properties.estatus_persona_desaparecida || 'N/A'}<br />
                <strong>Foto:</strong> <a href="${marker.properties.ruta_foto || '#'}" target="_blank">Ver Imagen</a>
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
