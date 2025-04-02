import React from 'react';
import getTodayDate from '../utils/getTodayDate';

const calculateDaysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
};

const ModalRelation = ({ edge, onClose, repdData = {}, pfsiData = {} }) => { // Default empty objects
  if (!edge) return null;

  const repdInfo = repdData[edge.repd_id?.trim()?.toLowerCase()] || {}; // Safeguard for undefined keys
  const pfsiInfo = pfsiData[edge.pfsi_id?.trim()?.toLowerCase()] || {}; // Match using pfsi_id
  const today = getTodayDate();

  const daysSinceDisappearance = repdInfo.fecha_desaparicion
    ? calculateDaysDifference(repdInfo.fecha_desaparicion, pfsiInfo.Fecha_Ingreso)
    : 'N/A';

  const daysSinceForensicRecord = pfsiInfo.Fecha_Ingreso
    ? calculateDaysDifference(pfsiInfo.Fecha_Ingreso, today)
    : 'N/A';

  console.log('edge:', edge);
  console.log('repdInfo:', repdInfo);
  console.log('pfsiInfo:', pfsiInfo);

  return (
    <>
      <div style={{ position:'absolute', zIndex: 7, right: '20vw', top : 10, textAlign: 'center', marginTop: '20px' }}>
        <h2>Relación entre reportes</h2>
        <p>Desaparición: {repdInfo.fecha_desaparicion}</p>
        <p>Ingreso forense: {pfsiInfo.Fecha_Ingreso}</p>
        <p>Hoy: {today}</p>
        <p>Han pasado {daysSinceDisappearance} días desde el reporte de desaparición y el registro forense.</p>
        <p>Han pasado {daysSinceForensicRecord} días desde el registro forense y hoy.</p>
      </div>
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: 'calc(20vw + 20px)',
          zIndex: 5,
          background: '#fff',
          padding: '20px',
          height: 'calc(100vh - 80px)',
          width: '17vw',
          overflowY: 'auto',
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
          <strong>Reporte de Búsqueda</strong>
          <div style={{ marginTop: '10px' }}>
            <p>
              {repdInfo.ruta_foto ? (
                <img 
                  src={repdInfo.ruta_foto} 
                  alt="REPD Photo" 
                  style={{ maxWidth: '100%', marginTop: '10px' }}
                />
              ) : (
                'N/A'
              )}
            </p>
            <p><strong>Nombre:</strong> {repdInfo.nombre_completo}</p>
            <p>Reportado desaparecido el <strong>{repdInfo.fecha_desaparicion}</strong>, 
                tenía <strong>{repdInfo.edad_momento_desaparicion}</strong> años el día que se levantó su reporte.</p>
            <p>Se describió que tenía un tatuaje: <strong>{edge.repd_description}</strong>.</p>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '20px 0',
          }}
        >
          <div
            style={{
              width: '0',
              height: '0',
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '10px solid #ccc',
            }}
          />
        </div>
        <div style={{ textAlign: 'center' }}>
          <strong>Posible relación mediante tatuaje</strong>
          <div style={{ marginTop: '10px' }}>
            <p><strong>Nombre en registro forense:</strong> {pfsiInfo.Probable_nombre}</p>
            <p><strong>Instituto ubicado en:</strong> {pfsiInfo.Delegacion_IJCF}</p>
            <p><strong>Descripción del tatuaje:</strong> {edge.pfsi_description}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalRelation;
