import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import Papa from 'papaparse';
import edgesData from '/src/csv/tattoo_matches_all.csv';

const Edges_csv = ({ map, repdMarkers, pfsiMarkers }) => {
  const [filterText, setFilterText] = useState('');
  const [filteredEdges, setFilteredEdges] = useState([]);
  const [selectedEdge, setSelectedEdge] = useState(null); // State for the selected edge
  const svgContainerRef = useRef(null);

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

    svgContainerRef.current = svgContainer;

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
      const relatedRepdIds = new Set();

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

              if (
                filterText &&
                !(
                  row.pfsi_description?.toLowerCase().includes(filterText.toLowerCase()) ||
                  row.pfsi_location?.toLowerCase().includes(filterText.toLowerCase()) ||
                  row.repd_description?.toLowerCase().includes(filterText.toLowerCase()) ||
                  row.repd_location?.toLowerCase().includes(filterText.toLowerCase()) ||
                  row.missing_name?.toLowerCase().includes(filterText.toLowerCase()) ||
                  row.body_name?.toLowerCase().includes(filterText.toLowerCase())
                )
              ) {
                return; // Skip edges that don't match the filter
              }

              edges.push({
                source: map.project(sourceCoords),
                target: map.project(targetCoords),
                sourceMarker,
                targetMarker,
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

              relatedRepdIds.add(normalizedRepdId);
            }
          });

          setFilteredEdges(edges);

          // Hide unrelated REPD markers
          repdMarkers.forEach((marker) => {
            const markerId = String(marker.id).trim().toLowerCase();
            if (relatedRepdIds.has(markerId)) {
              marker.getElement().style.display = 'block';
            } else {
              marker.getElement().style.display = 'none';
            }
          });

          const links = svgContainer.selectAll('path').data(edges);

          links
            .enter()
            .append('path')
            .style('opacity', 0) // Start with opacity 0
            .style('pointer-events', 'visibleStroke') // Enable pointer events for edges
            .style('stroke-width', 4)
            .merge(links)
            .attr('d', (d) => {
              const midX = (d.source.x + d.target.x) / 2;
              const midY = (d.source.y + d.target.y) / 2 - 100; // Adjust curve height
              return `M${d.source.x},${d.source.y} Q${midX},${midY} ${d.target.x},${d.target.y}`;
            })
            .attr('stroke', '#ccc')
            .attr('fill', 'none')
            .on('click', (event, d) => {
              setSelectedEdge(d); // Set the selected edge
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
                .style('opacity', 1)
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

    // Add click event to reset filtered edges
    map.on('click', () => {
      setSelectedEdge(null); // Reset selected edge
      svgContainerRef.current.selectAll('path').style('opacity', 1); // Show all edges
      repdMarkers.forEach((marker) => (marker.getElement().style.display = 'block')); // Show all REPD markers
      pfsiMarkers.forEach((marker) => (marker.getElement().style.display = 'block')); // Show all PFSI markers
    });

    updateLinks();

    return () => {
      map.off('move', render);
      map.off('resize', render);
      map.off('click'); // Remove click event listener
      svgContainer.remove();
      tooltip.remove();
    };
  }, [map, repdMarkers, pfsiMarkers, filterText]);

  useEffect(() => {
    if (!svgContainerRef.current) return; // Ensure svgContainerRef.current is not null

    const svgContainer = svgContainerRef.current;

    if (!selectedEdge) {
      // Reset to show only filtered edges and their related nodes
      svgContainer.selectAll('path').style('opacity', (d) => (filteredEdges.includes(d) ? 1 : 0));
      svgContainer.selectAll('path').style('pointer-events', (d) => (filteredEdges.includes(d) ? 'auto' : 'none'));

      // Show only nodes related to filtered edges
      const relatedRepdIds = new Set(filteredEdges.map((edge) => edge.targetMarker.id));
      const relatedPfsiIds = new Set(filteredEdges.map((edge) => edge.sourceMarker.id));

      repdMarkers.forEach((marker) => {
        if (relatedRepdIds.has(marker.id)) {
          marker.getElement().style.display = 'block';
          marker.getElement().style.opacity = 1;
          marker.getElement().style.border = '3px solid orange';
        } else {
            marker.getElement().style.opacity = 0;
        }
      });

      pfsiMarkers.forEach((marker) => {
        if (relatedPfsiIds.has(marker.id)) {
          marker.getElement().style.display = 'block';
          marker.getElement().style.opacity = 1;
          marker.getElement().style.border = '3px solid orange';
        } else {
            marker.getElement().style.opacity = 0;
        }
      });

      return;
    }

    // Highlight the selected edge in red and dim other edges
    svgContainer.selectAll('path').style('opacity', (d) => (d === selectedEdge ? 1 : 0.2));
    svgContainer.selectAll('path').style('pointer-events', (d) => (d === selectedEdge ? 'auto' : 'none'));

    svgContainer
      .selectAll('path')
      .filter((d) => d === selectedEdge)
      .attr('stroke', 'red') // Force the selected edge to remain red
      .attr('stroke-width', 6);

    // Highlight the selected edge's nodes in red and set their opacity to 1
    repdMarkers.forEach((marker) => {
      if (marker.id === selectedEdge.targetMarker.id) {
        marker.getElement().style.display = 'block';
        marker.getElement().style.opacity = 1; // Ensure opacity is 1 for the selected node
        marker.getElement().style.border = '3px solid red';
      } else {
        marker.getElement().style.display = 'none';
      }
    });

    pfsiMarkers.forEach((marker) => {
      if (marker.id === selectedEdge.sourceMarker.id) {
        marker.getElement().style.display = 'block';
        marker.getElement().style.opacity = 1; // Ensure opacity is 1 for the selected node
        marker.getElement().style.border = '3px solid red';
      } else {
        marker.getElement().style.display = 'none';
      }
    });
  }, [selectedEdge, filteredEdges, repdMarkers, pfsiMarkers]);

  const highlightEdgeAndNodes = (edge, highlight) => {
    const svgContainer = svgContainerRef.current;
    if (!svgContainer) return; // Ensure svgContainer is not null

    const edgeElement = svgContainer.selectAll('path').filter((d) => d === edge);
    const sourceElement = edge.sourceMarker.getElement();
    const targetElement = edge.targetMarker.getElement();

    if (highlight) {
      edgeElement
        .attr('stroke', 'red')
        .attr('stroke-width', 6)
        .style('opacity', 1) // Ensure opacity is 1 for the hovered edge
        .style('z-index', 9);
      sourceElement.style.border = '3px solid red';
      sourceElement.style.opacity = 1; // Ensure opacity is 1 for the source node
      sourceElement.style.zIndex = 8;
      targetElement.style.border = '3px solid red';
      targetElement.style.opacity = 1; // Ensure opacity is 1 for the target node
      targetElement.style.zIndex = 8;
    } else {
      edgeElement
        .attr('stroke', '#ccc')
        .attr('stroke-width', 4)
        .style('opacity', 0.2) // Reset opacity when not hovered
        .style('z-index', 0);
      sourceElement.style.border = '3px solid orange';
      sourceElement.style.opacity = 0.2; // Reset opacity for the source node
      sourceElement.style.zIndex = 5;
      targetElement.style.border = '3px solid orange';
      targetElement.style.opacity = 0.2; // Reset opacity for the target node
      targetElement.style.zIndex = 5;
    }
  };

  return (
    <>
      <input
        type="text"
        placeholder="Filter edges..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 4,
          padding: '5px',
          border: '1px solid #ccc',
          borderRadius: '3px',
        }}
      />
      {filterText && (
        <div
          style={{
            position: 'absolute',
            top: '50px',
            left: '10px',
            zIndex: 4,
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '3px',
            padding: '10px',
            maxHeight: '200px',
            overflowY: 'auto',
            width: '300px',
          }}
        >
          <strong>Filtered Edges:</strong>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            {filteredEdges.map((edge, index) => (
              <li
                key={index}
                style={{ marginBottom: '10px', cursor: 'pointer' }}
                onMouseEnter={() => highlightEdgeAndNodes(edge, true)}
                onMouseLeave={() => highlightEdgeAndNodes(edge, false)}
              >
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedEdge(edge); // Set the selected edge on click
                  }}
                >
                  {edge.missing_name} - {edge.body_name}<br />
                  {edge.pfsi_description} - {edge.repd_description}<br />
                  {edge.pfsi_location} - {edge.repd_location}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default Edges_csv;
