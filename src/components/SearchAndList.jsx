import React, { useState } from 'react';

const SearchAndList = ({
  filterText,
  setFilterText,
  filteredEdges,
  highlightEdgeAndNodes,
  setHoveredEdge,
  setSelectedEdge,
  selectedEdge,
}) => {
  const [filteredEdgeList, setFilteredEdgeList] = useState(null); // New state

  return (
    <>
      <input
        type="text"
        placeholder="Buscador (rosa, mano, antonio, etc.)"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 4,
          width: '17vw',
          padding: '10px',
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
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
            width: '17vw',
          }}
        >
          <strong>Posibles relaciones:</strong>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            {filteredEdges.map((edge, index) => (
              <li
                key={index}
                className={`edge-item ${
                  edge === selectedEdge || edge === filteredEdgeList ? 'selected' : ''
                }`}
                onMouseEnter={() => {
                  highlightEdgeAndNodes(edge, true);
                  setHoveredEdge(edge); // Set the hovered edge
                }}
                onMouseLeave={() => {
                  setHoveredEdge(null); // Clear hovered edge
                  highlightEdgeAndNodes(edge, false);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedEdge(edge); // Set the selected edge on click
                  setFilteredEdgeList(edge); // Update filteredEdgeList state
                }}
              >
                <a
                  style={{ textDecoration: 'none', color: '#000' }}
                  href="#"
                >
                  {edge.missing_name}
                  <br />
                  <span style={{ fontSize: '0.8em', color: '#666' }}>
                    {edge.repd_description} → {edge.pfsi_description}
                    <hr />
                    {edge.repd_location} → {edge.pfsi_location}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default SearchAndList;
