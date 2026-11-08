import React, { useState } from 'react';

export default function FormularioUsuario({ onCrearUsuario }) {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    rol: 'ANALISTA',
    password: '',
    confirmarPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre.trim() || !formData.correo.trim()) {
      setError('El nombre y correo son obligatorios.');
      return;
    }

    if (!formData.password.trim()) {
      setError('Debes asignar una contraseña inicial.');
      return;
    }

    if (formData.password !== formData.confirmarPassword) {
      setError('Las contraseñas ingresadas no coinciden. Por favor verifícalas.');
      return;
    }

    const nuevoUsuario = {
      id: Date.now(),
      nombre: formData.nombre.trim(),
      correo: formData.correo.trim().toLowerCase(),
      rol: formData.rol,
      password: formData.password
    };

    onCrearUsuario(nuevoUsuario);

    setFormData({
      nombre: '',
      correo: '',
      rol: 'ANALISTA',
      password: '',
      confirmarPassword: ''
    });
  };

  return (
    <div className="card shadow-sm border-0 mb-4 bg-white rounded-3">
      <div className="card-header bg-white py-3 border-bottom">
        <h6 className="mb-0 fw-bold text-primary">
          <i className="bi bi-person-plus-fill me-2"></i>
          Registrar Nuevo Usuario Corporativo
        </h6>
      </div>
      <div className="card-body p-4">
        {error && (
          <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Fila 1: Datos Personales e Institucionales */}
            <div className="col-md-5">
              <label className="form-label small fw-semibold">Nombre Completo *</label>
              <input
                type="text"
                name="nombre"
                className="form-control form-control-sm"
                placeholder="Ej. Sebastián Vargas"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold">Correo Institucional *</label>
              <input
                type="email"
                name="correo"
                className="form-control form-control-sm"
                placeholder="usuario@aquachile.cl"
                value={formData.correo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold">Rol de Acceso *</label>
              <select
                name="rol"
                className="form-select form-select-sm"
                value={formData.rol}
                onChange={handleChange}
              >
                <option value="ANALISTA">ANALISTA (Revisión y filtro)</option>
                <option value="EVALUADOR">EVALUADOR (Psicólogo / Dictamen)</option>
                <option value="ADMIN">ADMIN (Acceso Total)</option>
              </select>
            </div>

            {/* Fila 2: Credenciales con Verificación Doble */}
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Contraseña Inicial *</label>
              <input
                type="password"
                name="password"
                className="form-control form-control-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold">Confirmar Contraseña *</label>
              <input
                type="password"
                name="confirmarPassword"
                className={`form-control form-control-sm ${
                  formData.confirmarPassword && formData.password !== formData.confirmarPassword
                    ? 'is-invalid'
                    : ''
                }`}
                placeholder="Repite la contraseña"
                value={formData.confirmarPassword}
                onChange={handleChange}
                required
              />
              {formData.confirmarPassword && formData.password !== formData.confirmarPassword && (
                <div className="invalid-feedback small">Las contraseñas no coinciden.</div>
              )}
            </div>
          </div>

          <div className="text-end mt-4 pt-2 border-top">
            <button type="submit" className="btn btn-primary btn-sm px-4">
              Guardar Usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}