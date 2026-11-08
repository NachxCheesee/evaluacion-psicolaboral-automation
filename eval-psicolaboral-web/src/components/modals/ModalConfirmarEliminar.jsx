import React, { useEffect } from 'react';

export default function ModalConfirmarEliminar({ solicitud, onClose, onCerrar, onConfirmar }) {
  const cerrarModal = onClose || onCerrar || (() => {});

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') cerrarModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cerrarModal]);

  if (!solicitud) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', zIndex: 1055 }}
      onClick={cerrarModal}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-3">
          <div className="modal-header bg-danger text-white py-3">
            <h5 className="modal-title fw-bold mb-0">Confirmar Eliminación de Registro</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Cerrar"
              onClick={cerrarModal}
            ></button>
          </div>

          <div className="modal-body p-4 text-center">
            <div className="text-danger mb-3">
              <i className="bi bi-trash3-fill" style={{ fontSize: '3rem' }}></i>
            </div>
            <h5 className="fw-bold text-dark mb-2">¿Estás seguro de eliminar este registro?</h5>
            <p className="text-muted small mb-0">
              Estás a punto de borrar definitivamente la postulación de{' '}
              <strong>{solicitud.candidato}</strong> (RUT: {solicitud.rut}) para el cargo de{' '}
              <strong>{solicitud.cargo}</strong>. Esta acción no se puede deshacer.
            </p>
          </div>

          <div className="modal-footer bg-light py-2 justify-content-center">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm px-4"
              onClick={cerrarModal}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm px-4 fw-semibold"
              onClick={onConfirmar}
            >
              Sí, Eliminar Registro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}