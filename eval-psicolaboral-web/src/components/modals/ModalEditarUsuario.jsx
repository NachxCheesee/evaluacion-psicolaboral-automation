import React, { useState, useEffect } from 'react';

export default function ModalEditarUsuario({ usuario, onClose, onCerrar, onGuardarEdicion }) {
  const cerrarModal = onClose || onCerrar || (() => {});

  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    correo: usuario?.correo || '',
    rol: usuario?.rol || 'ANALISTA',
    nuevaPassword: '',
    confirmarPassword: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') cerrarModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cerrarModal]);

  if (!usuario) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validación si decidió cambiar contraseña
    if (formData.nuevaPassword.trim() || formData.confirmarPassword.trim()) {
      if (formData.nuevaPassword !== formData.confirmarPassword) {
        setError('Las nuevas contraseñas no coinciden.');
        return;
      }
    }

    onGuardarEdicion({
      ...usuario,
      nombre: formData.nombre.trim(),
      correo: formData.correo.trim().toLowerCase(),
      rol: formData.rol,
      password: formData.nuevaPassword.trim() ? formData.nuevaPassword : usuario.password
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
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-3">
          <div className="modal-header bg-light py-3">
            <h5 className="modal-title fw-bold text-dark mb-0">
              <i className="bi bi-pencil-square text-primary me-2"></i>
              Editar Funcionario
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
              {error && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>{error}</span>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label small fw-semibold">Nombre Completo *</label>
                <input
                  type="text"
                  name="nombre"
                  className="form-control form-control-sm"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Correo Institucional *</label>
                <input
                  type="email"
                  name="correo"
                  className="form-control form-control-sm"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Rol del Sistema *</label>
                <select
                  name="rol"
                  className="form-select form-select-sm"
                  value={formData.rol}
                  onChange={handleChange}
                >
                  <option value="ANALISTA">ANALISTA</option>
                  <option value="EVALUADOR">EVALUADOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {/* Sección de cambio de contraseña opcional y verificada */}
              <div className="p-3 bg-light rounded-3 border mt-3">
                <div className="small fw-semibold text-dark mb-1">
                  <i className="bi bi-shield-lock me-1 text-primary"></i>
                  Cambiar Contraseña (Opcional)
                </div>
                <div className="text-muted small mb-2" style={{ fontSize: '0.8rem' }}>
                  Deja estos campos en blanco si deseas mantener la contraseña actual.
                </div>

                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <input
                      type="password"
                      name="nuevaPassword"
                      className="form-control form-control-sm"
                      placeholder="Nueva contraseña"
                      value={formData.nuevaPassword}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <input
                      type="password"
                      name="confirmarPassword"
                      className={`form-control form-control-sm ${
                        formData.confirmarPassword && formData.nuevaPassword !== formData.confirmarPassword
                          ? 'is-invalid'
                          : ''
                      }`}
                      placeholder="Repetir nueva contraseña"
                      value={formData.confirmarPassword}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                {formData.confirmarPassword && formData.nuevaPassword !== formData.confirmarPassword && (
                  <div className="text-danger small mt-1" style={{ fontSize: '0.78rem' }}>
                    Las nuevas contraseñas no coinciden.
                  </div>
                )}
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
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}