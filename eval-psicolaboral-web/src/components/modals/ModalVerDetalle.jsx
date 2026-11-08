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
          <div className="modal-header bg-light py-3">
            <h5 className="modal-title fw-bold text-primary mb-0">
              <i className="bi bi-file-earmark-person me-2"></i>
              Expediente del Postulante
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
                <span className="text-muted small">RUT: {solicitud.rut}</span>
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
                      <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle small fw-normal">Agendada</span>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center gap-2 mt-1 text-warning-emphasis">
                      <i className="bi bi-calendar-x fs-5 text-warning"></i>
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
                <div>{solicitud.direccion || 'No registrada'}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1 fw-semibold">Teléfono de Contacto</label>
                <div>{solicitud.contacto || 'No registrado'}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small mb-1 fw-semibold">Correo Electrónico</label>
                <div>{solicitud.email || 'No registrado'}</div>
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
                <label className="form-label fw-semibold small text-primary mb-1">
                  <i className="bi bi-chat-left-text me-1"></i>
                  Observaciones Clínicas del Evaluador
                </label>
                <p className="small mb-0 text-dark">{solicitud.observacionesEvaluador}</p>
              </div>
            )}

            {/* Archivos Adjuntos */}
            <div>
              <label className="form-label fw-semibold small text-muted mb-2">Documentos Adjuntos</label>
              <div className="d-flex flex-wrap gap-2">
                {solicitud.cvArchivo ? (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                    onClick={() => handleDescargar(solicitud.cvArchivo)}
                  >
                    <i className="bi bi-file-earmark-pdf"></i>
                    <span>CV: {solicitud.cvArchivo}</span>
                  </button>
                ) : (
                  <span className="badge bg-light text-muted border py-2 px-3">Sin CV adjunto</span>
                )}

                {solicitud.entrevistaArchivo && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                    onClick={() => handleDescargar(solicitud.entrevistaArchivo)}
                  >
                    <i className="bi bi-file-earmark-text"></i>
                    <span>Pauta: {solicitud.entrevistaArchivo}</span>
                  </button>
                )}

                {solicitud.informeArchivo && (
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
                    onClick={() => handleDescargar(solicitud.informeArchivo)}
                  >
                    <i className="bi bi-file-earmark-check"></i>
                    <span>Informe: {solicitud.informeArchivo}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Pie */}
          <div className="modal-footer bg-light py-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm px-4"
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