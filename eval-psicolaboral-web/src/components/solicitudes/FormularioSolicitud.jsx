import React, { useState } from 'react';

export default function FormularioSolicitud({ onCrearSolicitud, usuarioActual }) {
  const [formData, setFormData] = useState({
    rut: '',
    candidato: '',
    cargo: '',
    contacto: '',
    email: '',
    direccion: '',
    origen: 'Externo',
    observaciones: '',
    cvArchivo: null
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      cvArchivo: file ? file.name : null
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.rut.trim() || !formData.candidato.trim() || !formData.cargo.trim()) {
      setError('RUT, Nombre del Candidato y Cargo son campos obligatorios.');
      return;
    }

    const nuevaSolicitud = {
      id: Date.now(),
      ...formData,
      emisor: usuarioActual ? usuarioActual.correo : 'analista@aquachile.cl',
      estado: 'Pendiente',
      fecha: new Date().toISOString().split('T')[0],
      entrevistaArchivo: null,
      informeArchivo: null,
      resultado: null,
      fechaEntrevista: null,
      observacionesEvaluador: null
    };

    onCrearSolicitud(nuevaSolicitud);

    // Resetear formulario
    setFormData({
      rut: '',
      candidato: '',
      cargo: '',
      contacto: '',
      email: '',
      direccion: '',
      origen: 'Externo',
      observaciones: '',
      cvArchivo: null
    });
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white py-3">
        <h6 className="mb-0 fw-bold text-primary">Nueva Solicitud de Evaluación</h6>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label small fw-semibold">RUT Candidato *</label>
              <input
                type="text"
                name="rut"
                className="form-control form-control-sm"
                placeholder="12.345.678-9"
                value={formData.rut}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-5">
              <label className="form-label small fw-semibold">Nombre Completo *</label>
              <input
                type="text"
                name="candidato"
                className="form-control form-control-sm"
                placeholder="Ej. Juan Pérez"
                value={formData.candidato}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold">Origen *</label>
              <select
                name="origen"
                className="form-select form-select-sm"
                value={formData.origen}
                onChange={handleChange}
              >
                <option value="Externo">Externo (Postulación)</option>
                <option value="Interno">Interno (Concurso / Traslado)</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold">Cargo al que Postula *</label>
              <input
                type="text"
                name="cargo"
                className="form-control form-control-sm"
                placeholder="Ej. Operario de Planta"
                value={formData.cargo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold">Teléfono</label>
              <input
                type="text"
                name="contacto"
                className="form-control form-control-sm"
                placeholder="+56 9 1234 5678"
                value={formData.contacto}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-semibold">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                className="form-control form-control-sm"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold">Dirección / Residencia</label>
              <input
                type="text"
                name="direccion"
                className="form-control form-control-sm"
                placeholder="Ciudad o Faena"
                value={formData.direccion}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-semibold">Adjuntar CV (Simulado)</label>
              <input
                type="file"
                className="form-control form-control-sm"
                onChange={handleFileChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold">Observaciones Iniciales</label>
              <textarea
                name="observaciones"
                rows="2"
                className="form-control form-control-sm"
                placeholder="Anotaciones para el evaluador..."
                value={formData.observaciones}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className="text-end mt-3">
            <button type="submit" className="btn btn-primary btn-sm px-4">
              Registrar Candidato
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}