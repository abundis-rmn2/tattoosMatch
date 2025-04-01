import React, { useEffect } from 'react';
import * as d3 from 'd3';
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

    const svgContainer = d3
      .select(map.getContainer())
      .append('svg')
      .attr('class', 'd3-overlay')
      .style('position', 'absolute')
      .style('top', 0)
      .style('left', 0)
      .style('width', '100%')
      .style('height', '100%')
      .style('pointer-events', 'none') // Disable pointer events for the SVG container
      .style('z-index', '0'); // Ensure edges are below markers

    const tooltip = d3
      .select(map.getContainer())
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '5px')
      .style('border-radius', '3px')
      .style('pointer-events', 'none')
      .style('z-index', '3') // Ensure tooltip is above edges
      .style('opacity', 0);

    const updateLinks = () => {
      const edges = [];
      Papa.parse(edgesData, {
        download: true,
        header: true,
        complete: (result) => {
          console.log(result.data);
          result.data.forEach((row) => {
            if (row.pfsi_id && row.repd_id) {
              const normalizedPfsiId = String(row.pfsi_id).trim().toLowerCase();
              const normalizedRepdId = String(row.repd_id).trim().toLowerCase();

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

              edges.push({
                source: map.project(sourceCoords),
                target: map.project(targetCoords),
                body_age: row.body_age,
                body_location: row.body_location,
                body_name: row.body_name,
                location_similarity: row.location_similarity,
                missing_age: row.missing_age,
                missing_location: row.missing_location,
                missing_name: row.missing_name,
                pfsi_description: row.pfsi_description,
                pfsi_id: row.pfsi_id,
                pfsi_location: row.pfsi_location,
                repd_description: row.repd_description,
                repd_id: row.repd_id,
                repd_location: row.repd_location,
                similarity: row.similarity,
                text_match: row.text_match,
                text_similarity: row.text_similarity,
              });
            }
          });

          const links = svgContainer.selectAll('path').data(edges);

          links
            .enter()
            .append('path')
            .style('opacity', 0) // Start with opacity 0
            .style('pointer-events', 'visibleStroke') // Enable pointer events for edges
            .merge(links)
            .attr('d', (d) => {
              const midX = (d.source.x + d.target.x) / 2;
              const midY = (d.source.y + d.target.y) / 2 - 100; // Adjust curve height
              return `M${d.source.x},${d.source.y} Q${midX},${midY} ${d.target.x},${d.target.y}`;
            })
            .attr('stroke', '#ccc')
            .attr('fill', 'none')
            .on('click', (event, d) => {
              const filteredNodes = {
                repd_id: d.repd_id,
                pfsi_id: d.pfsi_id,
              };
              console.log('Filtered Nodes:', filteredNodes);
              // Add your filtering logic here, e.g., updating state or triggering a callback
            })
            .on('mouseover', (event, d) => {
              tooltip
                .html(`
                  <strong>Body Age:</strong> ${d.body_age}<br>
                  <strong>Body Location:</strong> ${d.body_location}<br>
                  <strong>Body Name:</strong> ${d.body_name}<br>
                  <strong>Location Similarity:</strong> ${d.location_similarity}<br>
                  <strong>Missing Age:</strong> ${d.missing_age}<br>
                  <strong>Missing Location:</strong> ${d.missing_location}<br>
                  <strong>Missing Name:</strong> ${d.missing_name}<br>
                  <strong>PFSI Description:</strong> ${d.pfsi_description}<br>
                  <strong>PFSI ID:</strong> ${d.pfsi_id}<br>
                  <strong>PFSI Location:</strong> ${d.pfsi_location}<br>
                  <strong>REPD Description:</strong> ${d.repd_description}<br>
                  <strong>REPD ID:</strong> ${d.repd_id}<br>
                  <strong>REPD Location:</strong> ${d.repd_location}<br>
                  <strong>Similarity:</strong> ${d.similarity}<br>
                  <strong>Text Match:</strong> ${d.text_match}<br>
                  <strong>Text Similarity:</strong> ${d.text_similarity}
                `)
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY + 10}px`)
                .style('opacity', 1);
            })
            .on('mousemove', (event) => {
              tooltip
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY + 10}px`);
            })
            .on('mouseout', () => {
              tooltip.style('opacity', 0);
            })
            .transition()
            .duration(300) // Fade-in duration
            .style('opacity', 1);

          links
            .exit()
            .transition()
            .duration(30) // Fade-out duration
            .style('opacity', 0)
            .remove();

          const labels = svgContainer.selectAll('text').data(edges);

          labels
            .enter()
            .append('text')
            .style('opacity', 0) // Start with opacity 0
            .merge(labels)
            .attr('x', (d) => (d.source.x + d.target.x) / 2)
            .attr('y', (d) => (d.source.y + d.target.y) / 2)
            .attr('fill', '#000')
            .attr('font-size', '12px')
            .attr('text-anchor', 'middle')
            .text((d) => d.similarity)
            .transition()
            .duration(300) // Fade-in duration
            .style('opacity', 1);

          labels
            .exit()
            .transition()
            .duration(30) // Fade-out duration
            .style('opacity', 0)
            .remove();
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        },
      });
    };

    const render = () => {
      svgContainer.selectAll('path').transition().duration(300).style('opacity', 0).remove();
      svgContainer.selectAll('text').transition().duration(300).style('opacity', 0).remove();
      updateLinks();
    };

    map.on('move', render);
    map.on('resize', render);

    updateLinks();

    return () => {
      map.off('move', render);
      map.off('resize', render);
      svgContainer.remove();
      tooltip.remove();
    };
  }, [map, repdMarkers, pfsiMarkers]);

  return null;
};

export default Edges_csv;
