import React, { useEffect } from 'react';
import Papa from 'papaparse';
import edgesData from '/src/csv/tattoo_matches_all.csv';

const Edges_csv = ({ map, repdMarkers, pfsiMarkers }) => {
  useEffect(() => {
    if (!map || !repdMarkers.length || !pfsiMarkers.length) {
      console.warn('Map or markers are not ready.');
      return;
    }

    const repdMarkerMap = new Map(
      repdMarkers.map((marker) => [String(marker.id).trim().toLowerCase(), marker])
    );
    const pfsiMarkerMap = new Map(
      pfsiMarkers.map((marker) => [String(marker.id).trim().toLowerCase(), marker])
    );

    console.log('REPD Marker Map:', Array.from(repdMarkerMap.keys())); // Debugging log
    console.log('PFSI Marker Map:', Array.from(pfsiMarkerMap.keys())); // Debugging log

    const edges = [];
    Papa.parse(edgesData, {
      download: true,
      header: true,
      complete: (result) => {
        console.log('CSV parsed:', result.data);
        result.data.forEach((row) => {
          if (row.pfsi_id && row.repd_id) {
            const normalizedPfsiId = String(row.pfsi_id).trim().toLowerCase();
            const normalizedRepdId = String(row.repd_id).trim().toLowerCase();

            console.log('Looking up PFSI ID:', normalizedPfsiId); // Debugging log
            console.log('PFSI ID exists in map:', pfsiMarkerMap.has(normalizedPfsiId)); // Check existence
            console.log('Looking up REPD ID:', normalizedRepdId); // Debugging log
            console.log('REPD ID exists in map:', repdMarkerMap.has(normalizedRepdId)); // Check existence

            const sourceMarker = pfsiMarkerMap.get(normalizedPfsiId);
            const targetMarker = repdMarkerMap.get(normalizedRepdId);

            if (!sourceMarker || !targetMarker) {
              console.warn('Marker not found for row:', row);
              return;
            }

            const sourceCoords = sourceMarker.getLngLat?.().toArray();
            const targetCoords = targetMarker.getLngLat?.().toArray();

            if (!sourceCoords || !targetCoords) {
              console.error('Invalid coordinates for markers:', {
                sourceMarker,
                targetMarker,
              });
              return;
            }

            const line = {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [sourceCoords, targetCoords],
              },
              properties: {},
            };
            edges.push(line);
          }
        });

        console.log('Edges created:', edges);

        const edgeLayer = {
          id: 'edges-layer',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: edges,
            },
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#ccc',
            'line-width': 2,
          },
        };

        if (map.getLayer('edges-layer')) {
          console.log('Updating existing edges-layer.');
          map.getSource('edges-layer').setData(edgeLayer.source.data);
        } else {
          console.log('Adding new edges-layer.');
          map.addLayer(edgeLayer);
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      },
    });

    return () => {
      if (map.getLayer('edges-layer')) {
        console.log('Removing edges-layer.');
        map.removeLayer('edges-layer');
        map.removeSource('edges-layer');
      }
    };
  }, [map, repdMarkers, pfsiMarkers]);

  return null;
};

export default Edges_csv;
