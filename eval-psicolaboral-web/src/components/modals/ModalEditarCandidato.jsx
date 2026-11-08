import React, { useState, useEffect } from 'react';
import { FAMILIAS_CARGO } from '../../data/mockData';

export default function ModalEditarCandidato({ solicitud, onClose, onCerrar, onGuardarEdicion, onGuardar }) {
  const cerrarModal = onClose || onCerrar || (() => {});
  const guardar = onGuardarEdicion || onGuardar || (() => {});

  const [formData, setFormData] = useState({
    candidato: solicitud?.candidato || '',
    rut: solicitud?.rut || '',
    cargo: solicitud?.cargo || '',
    origen: solicitud?.origen || 'Externo',
    contacto: solicitud?.contacto || '',
    email: solicitud?.email || '',
    direccion: solicitud?.direccion || '',
    observaciones: solicitud?.observaciones || '',
    cvArchivo: solicitud?.cvArchivo || null
  });

  const [nuevoCvNombre, setNuevoCvNombre] = useState('');

  // Salir con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') cerrarModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cerrarModal]);

  if (!solicitud) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNuevoCvNombre(file.name);
      setFormData((prev) => ({ ...prev, cvArchivo: file.name }));
    }
  };

  const handleDescargarActual = () => {
    alert(`Descargando CV registrado: ${formData.cvArchivo}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    guardar({
      ...solicitud,
      ...formData
    });
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
          <div className="modal-header bg-light py-3">
            <h5 className="modal-title fw-bold text-dark mb-0">
              <i className="bi bi-pencil-square text-primary me-2"></i>
              Editar Antecedentes del Postulante
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar"
              onClick={cerrarModal}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="row g-3">
                {/* Nombre */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Nombre y Apellidos *</label>
                  <input
                    type="text"
                    name="candidato"
                    className="form-control form-control-sm"
                    value={formData.candidato}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* RUT */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">RUT *</label>
                  <input
                    type="text"
                    name="rut"
                    className="form-control form-control-sm"
                    value={formData.rut}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Cargo */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Cargo de Postulación *</label>
                  <select
                    name="cargo"
                    className="form-select form-select-sm"
                    value={formData.cargo}
                    onChange={handleChange}
                    required
                  >
                    {FAMILIAS_CARGO.map((cargo, idx) => (
                      <option key={idx} value={cargo}>{cargo}</option>
                    ))}
                    <option value="Otro Cargo Operativo">Otro Cargo Operativo</option>
                  </select>
                </div>

                {/* Origen */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Origen de la Convocatoria</label>
                  <select
                    name="origen"
                    className="form-select form-select-sm"
                    value={formData.origen}
                    onChange={handleChange}
                  >
                    <option value="Externo">Externo (Postulación Web / Mercado Laboral)</option>
                    <option value="Interno">Interno (Concurso Interno / Traslado)</option>
                  </select>
                </div>

                {/* Teléfono */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Teléfono Móvil</label>
                  <input
                    type="text"
                    name="contacto"
                    className="form-control form-control-sm"
                    value={formData.contacto}
                    onChange={handleChange}
                  />
                </div>

                {/* Email */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control form-control-sm"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {/* Residencia */}
                <div className="col-12">
                  <label className="form-label small fw-semibold">Ciudad / Comuna de Residencia</label>
                  <input
                    type="text"
                    name="direccion"
                    className="form-control form-control-sm"
                    value={formData.direccion}
                    onChange={handleChange}
                  />
                </div>

                {/* SECCIÓN DOCUMENTACIÓN / CV */}
                <div className="col-12">
                  <div className="p-3 bg-light rounded-3 border">
                    <label className="form-label small fw-semibold text-dark d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-file-earmark-pdf text-danger fs-5"></i>
                      <span>Currículum Vitae (CV)</span>
                    </label>

                    {formData.cvArchivo ? (
                      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2 p-2 bg-white rounded border">
                        <div className="small">
                          <span className="text-muted">Archivo actual: </span>
                          <strong className="text-primary">{formData.cvArchivo}</strong>
                          {nuevoCvNombre && <span className="badge bg-warning text-dark ms-2">Por reemplazar</span>}
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={handleDescargarActual}
                        >
                          <i className="bi bi-download me-1"></i>
                          Descargar CV
                        </button>
                      </div>
                    ) : (
                      <div className="small text-muted mb-2">El candidato aún no tiene un archivo adjunto.</div>
                    )}

                    <label className="form-label small text-muted mb-1">
                      {formData.cvArchivo ? 'Reemplazar documento por uno nuevo:' : 'Subir documento:'}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="form-control form-control-sm"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                {/* Observaciones */}
                <div className="col-12">
                  <label className="form-label small fw-semibold">Observaciones / Experiencia Previa</label>
                  <textarea
                    name="observaciones"
                    rows="3"
                    className="form-control form-control-sm"
                    value={formData.observaciones}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light py-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-3"
                onClick={cerrarModal}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary btn-sm px-4">
                Guardar Modificaciones
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}