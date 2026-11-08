import React, { useEffect } from 'react';

export default function ModalVerDetalle({ solicitud, onClose, onCerrar }) {
  const cerrarModal = onClose || onCerrar || (() => {});

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') cerrarModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cerrarModal]);

  if (!solicitud) return null;

  const handleDescargar = (nombreArchivo) => {
    alert(`Descargando archivo simulado: ${nombreArchivo}`);
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', zIndex: 1055 }}
      onClick={cerrarModal}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-3">
          {/* Cabecera */}
          <div className="modal-header bg-light py-3 border-bottom">
            <h5 className="modal-title fw-bold text-primary mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-file-earmark-person"></i>
              <span>Expediente del Postulante</span>
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar"
              onClick={cerrarModal}
            ></button>
          </div>

          {/* Cuerpo */}
          <div className="modal-body p-4">
            <div className="d-flex justify-content-between align-items-start mb-3 pb-3 border-bottom">
              <div>
                <h5 className="mb-1 fw-bold text-dark">{solicitud.candidato}</h5>
                <span className="text-muted small">RUT: <strong className="text-dark">{solicitud.rut}</strong></span>
              </div>
              <div className="d-flex gap-2">
                <span className={`badge ${solicitud.origen === 'Interno' ? 'bg-primary' : 'bg-secondary'}`}>
                  {solicitud.origen || 'Externo'}
                </span>
                <span className="badge bg-dark">{solicitud.estado}</span>
              </div>
            </div>

            {/* SECCIÓN DE ESTADO DE ENTREVISTA Y EVALUACIÓN */}
            <div className="mb-3 p-3 bg-light rounded-3 border">
              <div className="row g-2 align-items-center">
                <div className="col-12 col-md-6 border-end-md">
                  <span className="text-muted small fw-semibold d-block">Fecha de Entrevista Psicolaboral:</span>
                  {solicitud.fechaEntrevista ? (
                    <div className="d-flex align-items-center gap-2 mt-1 text-primary fw-bold">
                      <i className="bi bi-calendar-event fs-5"></i>
                      <span>{solicitud.fechaEntrevista}</span>
                      <span className="badge bg-white text-primary border small fw-normal">Agendada</span>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center gap-2 mt-1 text-secondary">
                      <i className="bi bi-calendar-x fs-5 text-muted"></i>
                      <span className="small fw-semibold">Sin entrevista agendada (Pendiente)</span>
                    </div>
                  )}
                </div>

                <div className="col-12 col-md-6 ps-md-3">
                  <span className="text-muted small fw-semibold d-block">Estado del Dictamen:</span>
                  {solicitud.resultado ? (
                    <div className="d-flex align-items-center gap-2 mt-1 text-success fw-bold">
                      <i className="bi bi-check-circle-fill"></i>
                      <span>{solicitud.resultado}</span>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center gap-2 mt-1 text-secondary">
                      <i className="bi bi-hourglass-split"></i>
                      <span className="small">Pendiente de evaluación</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Datos Personales y de Cargo */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1 fw-semibold">Cargo de Postulación</label>
                <div className="fw-semibold text-dark">{solicitud.cargo}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1 fw-semibold">Ciudad / Comuna</label>
                <div className="text-dark">{solicitud.direccion || 'No registrada'}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1 fw-semibold">Teléfono de Contacto</label>
                <div className="text-dark">{solicitud.contacto || 'No registrado'}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1 fw-semibold">Correo Electrónico</label>
                <div className="text-dark">{solicitud.email || 'No registrado'}</div>
              </div>
            </div>

            {/* Observaciones Generales */}
            {solicitud.observaciones && (
              <div className="mb-3 p-3 bg-light rounded-3 border">
                <label className="form-label fw-semibold small text-muted mb-1">Observaciones / Experiencia Laboral</label>
                <p className="small mb-0 text-dark">{solicitud.observaciones}</p>
              </div>
            )}

            {/* Observaciones del Evaluador */}
            {solicitud.observacionesEvaluador && (
              <div className="mb-3 p-3 border rounded-3 bg-white">
                <label className="form-label fw-semibold small text-primary mb-1 d-flex align-items-center gap-2">
                  <i className="bi bi-chat-left-text"></i>
                  <span>Observaciones Clínicas del Evaluador</span>
                </label>
                <p className="small mb-0 text-dark">{solicitud.observacionesEvaluador}</p>
              </div>
            )}

            {/* Archivos Adjuntos (Diseño limpio y homogéneo sin botones rojos de peligro) */}
            <div>
              <label className="form-label fw-semibold small text-muted mb-2">Documentos Adjuntos</label>
              <div className="d-flex flex-wrap gap-2">
                {solicitud.cvArchivo ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-light border bg-white shadow-sm d-flex align-items-center gap-2 px-3 py-2 text-dark"
                    onClick={() => handleDescargar(solicitud.cvArchivo)}
                    title="Descargar Currículum Vitae"
                  >
                    <i className="bi bi-file-earmark-pdf text-danger fs-5"></i>
                    <span className="small fw-semibold">CV: {solicitud.cvArchivo}</span>
                  </button>
                ) : (
                  <span className="badge bg-light text-muted border py-2 px-3">Sin CV adjunto</span>
                )}

                {solicitud.entrevistaArchivo && (
                  <button
                    type="button"
                    className="btn btn-sm btn-light border bg-white shadow-sm d-flex align-items-center gap-2 px-3 py-2 text-dark"
                    onClick={() => handleDescargar(solicitud.entrevistaArchivo)}
                    title="Descargar Pauta de Entrevista"
                  >
                    <i className="bi bi-file-earmark-text text-primary fs-5"></i>
                    <span className="small fw-semibold">Pauta: {solicitud.entrevistaArchivo}</span>
                  </button>
                )}

                {solicitud.informeArchivo && (
                  <button
                    type="button"
                    className="btn btn-sm btn-light border bg-white shadow-sm d-flex align-items-center gap-2 px-3 py-2 text-dark"
                    onClick={() => handleDescargar(solicitud.informeArchivo)}
                    title="Descargar Informe Psicolaboral"
                  >
                    <i className="bi bi-file-earmark-check text-success fs-5"></i>
                    <span className="small fw-semibold">Informe: {solicitud.informeArchivo}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Pie */}
          <div className="modal-footer bg-light py-2 border-top">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm px-4"
              onClick={cerrarModal}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}