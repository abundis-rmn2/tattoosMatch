import React, { useState } from 'react';

const ModalRelation = ({ edge, onClose }) => {
  if (!edge) return null; // Do not render if no edge is provided
  console.log(edge)

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: 'calc(20vw + 20px)',
        zIndex: 5,
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: '5px',
        padding: '20px',
        maxHeight: 'calc(100vh - 100px)',
        width: '17vw',
        overflowY: 'auto'
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'transparent',
          border: 'none',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        ✖
      </button>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <strong>REPD Information</strong>
        <div style={{ marginTop: '10px' }}>
          <p><strong>Nombre del reporte:</strong> {edge.missing_name}</p>
          <p><strong>Vistó última vez en:</strong> {edge.missing_location}</p>
          <p><strong>Descripción del tatuaje:</strong> {edge.repd_description}</p>
        </div>
      </div>
      <div
        style={{
          height: '2px',
          background: '#ccc',
          margin: '20px 0',
        }}
      />
      <div style={{ textAlign: 'center' }}>
        <strong>PFSI Information</strong>
        <div style={{ marginTop: '10px' }}>
          <p><strong>Registro forense</strong> {edge.body_name}</p>
          <p><strong>Instituto Forense</strong> {edge.body_location}</p>
          <p><strong>Descripción del tatuaje:</strong> {edge.pfsi_description}</p>
        </div>
      </div>
    </div>
  );
};

export default ModalRelation;
