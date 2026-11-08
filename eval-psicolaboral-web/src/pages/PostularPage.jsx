import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FAMILIAS_CARGO } from '../data/mockData';

// --- UTILIDADES DE VALIDACIÓN ---

// Algoritmo Módulo 11 para RUT chileno
const validarRutChileno = (rutCompleto) => {
  if (!rutCompleto) return false;
  const limpio = rutCompleto.replace(/[^0-9kK]/g, '').toUpperCase();
  if (limpio.length < 8 || limpio.length > 9) return false;

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const resto = suma % 11;
  const dvEsperado = 11 - resto;
  let dvCalculado = '0';

  if (dvEsperado === 11) dvCalculado = '0';
  else if (dvEsperado === 10) dvCalculado = 'K';
  else dvCalculado = dvEsperado.toString();

  return dv === dvCalculado;
};

// Formateador automático de RUT (ej: 12.345.678-9)
const formatearRut = (texto) => {
  const limpio = texto.replace(/[^0-9kK]/g, '').toUpperCase();
  if (limpio.length <= 1) return limpio;

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);

  let cuerpoFormateado = '';
  for (let i = cuerpo.length - 1, j = 0; i >= 0; i--, j++) {
    if (j > 0 && j % 3 === 0) cuerpoFormateado = '.' + cuerpoFormateado;
    cuerpoFormateado = cuerpo.charAt(i) + cuerpoFormateado;
  }

  return `${cuerpoFormateado}-${dv}`;
};

// Validación de teléfono móvil chileno (+56 9 XXXX XXXX o 9 dígitos)
const validarTelefonoChileno = (telefono) => {
  const limpio = telefono.replace(/[^0-9]/g, '');
  // Formato: 9 dígitos comenzando en 9 (ej: 987654321) o 11 dígitos con prefijo 56 (56987654321)
  return (limpio.length === 9 && limpio.startsWith('9')) || (limpio.length === 11 && limpio.startsWith('569'));
};

export default function PostularPage({ onCrearSolicitud }) {
  const [formData, setFormData] = useState({
    rut: '',
    candidato: '',
    cargo: '',
    contacto: '',
    email: '',
    direccion: '',
    observaciones: '',
    cvArchivo: null
  });

  const [errores, setErrores] = useState({});
  const [archivoNombre, setArchivoNombre] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleRutChange = (e) => {
    const formateado = formatearRut(e.target.value);
    setFormData((prev) => ({ ...prev, rut: formateado }));

    if (formateado.length >= 8) {
      if (!validarRutChileno(formateado)) {
        setErrores((prev) => ({ ...prev, rut: 'RUT inválido (dígito verificador erróneo).' }));
      } else {
        setErrores((prev) => {
          const actual = { ...prev };
          delete actual.rut;
          return actual;
        });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpieza reactiva de errores
    if (errores[name]) {
      setErrores((prev) => {
        const actual = { ...prev };
        delete actual[name];
        return actual;
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFormData((prev) => ({ ...prev, cvArchivo: null }));
      setArchivoNombre('');
      return;
    }

    const extensionesValidas = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const esValido = extensionesValidas.includes(file.type) || file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx');
    const pesoMaximoMB = 5;

    if (!esValido) {
      setErrores((prev) => ({ ...prev, cvArchivo: 'Solo se admiten documentos en formato PDF o Word (.docx).' }));
      e.target.value = '';
      return;
    }

    if (file.size > pesoMaximoMB * 1024 * 1024) {
      setErrores((prev) => ({ ...prev, cvArchivo: `El archivo supera el límite de ${pesoMaximoMB} MB.` }));
      e.target.value = '';
      return;
    }

    setErrores((prev) => {
      const actual = { ...prev };
      delete actual.cvArchivo;
      return actual;
    });

    setArchivoNombre(file.name);
    setFormData((prev) => ({ ...prev, cvArchivo: file.name }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevosErrores = {};

    // 1. Validación de RUT
    if (!formData.rut.trim()) {
      nuevosErrores.rut = 'El RUT es obligatorio.';
    } else if (!validarRutChileno(formData.rut)) {
      nuevosErrores.rut = 'El RUT ingresado no es válido.';
    }

    // 2. Validación de Nombre
    if (!formData.candidato.trim() || formData.candidato.trim().split(' ').length < 2) {
      nuevosErrores.candidato = 'Ingresa nombre y al menos un apellido.';
    }

    // 3. Validación de Cargo
    if (!formData.cargo) {
      nuevosErrores.cargo = 'Selecciona el cargo de postulación.';
    }

    // 4. Validación de Teléfono Móvil
    if (!formData.contacto.trim()) {
      nuevosErrores.contacto = 'El teléfono de contacto es obligatorio.';
    } else if (!validarTelefonoChileno(formData.contacto)) {
      nuevosErrores.contacto = 'Ingresa un móvil chileno válido (ej: +56 9 1234 5678 o 912345678).';
    }

    // 5. Validación de Correo
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !regexEmail.test(formData.email)) {
      nuevosErrores.email = 'Ingresa un correo electrónico corporativo o personal válido.';
    }

    // 6. Validación de Residencia
    if (!formData.direccion.trim()) {
      nuevosErrores.direccion = 'Indica tu ciudad o comuna de residencia actual.';
    }

    // 7. Validación Obligatoria de CV
    if (!formData.cvArchivo) {
      nuevosErrores.cvArchivo = 'Debes adjuntar obligatoriamente tu currículum en PDF o DOCX.';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const nuevaPostulacion = {
      id: Date.now(),
      rut: formData.rut.trim(),
      candidato: formData.candidato.trim(),
      cargo: formData.cargo,
      contacto: formData.contacto.trim(),
      email: formData.email.trim().toLowerCase(),
      direccion: formData.direccion.trim(),
      observaciones: formData.observaciones.trim() || 'Postulación espontánea ingresada vía web.',
      cvArchivo: formData.cvArchivo,
      origen: 'Externo',
      emisor: 'Portal Público Web',
      estado: 'Pendiente',
      fecha: new Date().toISOString().split('T')[0],
      entrevistaArchivo: null,
      informeArchivo: null,
      resultado: null,
      fechaEntrevista: null,
      observacionesEvaluador: null
    };

    onCrearSolicitud(nuevaPostulacion);
    setEnviado(true);
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      {/* Header Institucional */}
      <header className="navbar navbar-expand-lg bg-white border-bottom shadow-sm px-4 py-3">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold text-decoration-none">
            <i className="bi bi-water text-primary fs-4"></i>
            <span className="text-primary fs-4">AquaChile</span>
            <span className="text-secondary small border-start ps-2 d-none d-sm-inline">
              Formulario de Reclutamiento
            </span>
          </Link>
          <Link to="/" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <i className="bi bi-arrow-left"></i>
            <span>Volver al Inicio</span>
          </Link>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="container my-5 flex-grow-1" style={{ maxWidth: '820px' }}>
        {enviado ? (
          <div className="card shadow-sm border-0 text-center p-5 bg-white rounded-3">
            <div className="mb-3 text-success">
              <i className="bi bi-check-circle-fill" style={{ fontSize: '3.5rem' }}></i>
            </div>
            <h3 className="fw-bold text-dark mb-2">¡Postulación Registrada Exitosamente!</h3>
            <p className="text-muted mx-auto mb-4" style={{ maxWidth: '580px' }}>
              Los antecedentes de <strong>{formData.candidato}</strong> para el cargo de <strong>{formData.cargo}</strong> han sido ingresados al sistema con el identificador RUT <strong>{formData.rut}</strong>.
            </p>
            <div className="alert alert-light border small text-muted mx-auto mb-4" style={{ maxWidth: '480px' }}>
              <i className="bi bi-info-circle me-1 text-primary"></i>
              Se ha archivado tu CV (<strong>{archivoNombre}</strong>). Nuestro equipo de selección te contactará al móvil <strong>{formData.contacto}</strong>.
            </div>
            <div className="d-flex justify-content-center gap-2">
              <Link to="/" className="btn btn-primary px-4 btn-sm">
                Volver al Sitio Principal
              </Link>
              <button
                type="button"
                className="btn btn-outline-secondary px-4 btn-sm"
                onClick={() => {
                  setEnviado(false);
                  setFormData({
                    rut: '',
                    candidato: '',
                    cargo: '',
                    contacto: '',
                    email: '',
                    direccion: '',
                    observaciones: '',
                    cvArchivo: null
                  });
                  setArchivoNombre('');
                  setErrores({});
                }}
              >
                Ingresar Otra Postulación
              </button>
            </div>
          </div>
        ) : (
          <div className="card shadow-sm border-0 bg-white rounded-3">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-file-earmark-person-fill text-primary fs-5"></i>
                <h5 className="fw-bold text-dark mb-0">Postulación Abierta a Faenas y Plantas</h5>
              </div>
              <p className="text-muted small mb-0 mt-1">
                Completa tus antecedentes verificables. Todos los campos marcados con asterisco (*) son obligatorios.
              </p>
            </div>

            <div className="card-body p-4">
              {Object.keys(errores).length > 0 && (
                <div className="alert alert-danger py-2 small d-flex align-items-center gap-2 mb-4">
                  <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                  <span>Existen campos incompletos o con formato incorrecto. Por favor corrígelos para continuar.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  {/* RUT */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">RUT Candidato *</label>
                    <input
                      type="text"
                      name="rut"
                      maxLength={12}
                      className={`form-control form-control-sm ${errores.rut ? 'is-invalid' : ''}`}
                      placeholder="Ej: 12.345.678-9"
                      value={formData.rut}
                      onChange={handleRutChange}
                      required
                    />
                    {errores.rut ? (
                      <div className="invalid-feedback small">{errores.rut}</div>
                    ) : (
                      <div className="form-text small">Con puntos y guión (validado con Módulo 11).</div>
                    )}
                  </div>

                  {/* Nombre Completo */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">Nombre y Apellidos *</label>
                    <input
                      type="text"
                      name="candidato"
                      className={`form-control form-control-sm ${errores.candidato ? 'is-invalid' : ''}`}
                      placeholder="Ej: Juan Carlos Pérez Soto"
                      value={formData.candidato}
                      onChange={handleChange}
                      required
                    />
                    {errores.candidato && <div className="invalid-feedback small">{errores.candidato}</div>}
                  </div>

                  {/* Cargo al que Postula */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">Cargo de Interés *</label>
                    <select
                      name="cargo"
                      className={`form-select form-select-sm ${errores.cargo ? 'is-invalid' : ''}`}
                      value={formData.cargo}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Selecciona una vacante disponible --</option>
                      {FAMILIAS_CARGO.map((cargo, idx) => (
                        <option key={idx} value={cargo}>
                          {cargo}
                        </option>
                      ))}
                      <option value="Otro Cargo Operativo">Otro Cargo Operativo / Administrativo</option>
                    </select>
                    {errores.cargo && <div className="invalid-feedback small">{errores.cargo}</div>}
                  </div>

                  {/* Teléfono Móvil */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">Teléfono Móvil de Contacto *</label>
                    <input
                      type="tel"
                      name="contacto"
                      className={`form-control form-control-sm ${errores.contacto ? 'is-invalid' : ''}`}
                      placeholder="+56 9 8765 4321"
                      value={formData.contacto}
                      onChange={handleChange}
                      required
                    />
                    {errores.contacto ? (
                      <div className="invalid-feedback small">{errores.contacto}</div>
                    ) : (
                      <div className="form-text small">Obligatorio para la citación a entrevista.</div>
                    )}
                  </div>

                  {/* Correo Electrónico */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">Correo Electrónico *</label>
                    <input
                      type="email"
                      name="email"
                      className={`form-control form-control-sm ${errores.email ? 'is-invalid' : ''}`}
                      placeholder="nombre.apellido@ejemplo.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    {errores.email && <div className="invalid-feedback small">{errores.email}</div>}
                  </div>

                  {/* Dirección / Comuna */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-dark">Ciudad o Comuna de Residencia *</label>
                    <input
                      type="text"
                      name="direccion"
                      className={`form-control form-control-sm ${errores.direccion ? 'is-invalid' : ''}`}
                      placeholder="Ej: Puerto Montt, Castro, Calbuco, Quellón..."
                      value={formData.direccion}
                      onChange={handleChange}
                      required
                    />
                    {errores.direccion && <div className="invalid-feedback small">{errores.direccion}</div>}
                  </div>

                  {/* Carga de Currículum OBLIGATORIA */}
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-dark">Currículum Vitae Actualizado (Obligatorio) *</label>
                    <div className="input-group input-group-sm">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className={`form-control ${errores.cvArchivo ? 'is-invalid' : ''}`}
                        onChange={handleFileChange}
                        required
                      />
                    </div>
                    {errores.cvArchivo ? (
                      <div className="text-danger small mt-1">{errores.cvArchivo}</div>
                    ) : (
                      <div className="form-text small">
                        Admite formato <strong>PDF</strong> o <strong>Word</strong> (máximo 5 MB). Requisito indispensable para avanzar a evaluación.
                      </div>
                    )}
                  </div>

                  {/* Experiencia / Observaciones Adicionales */}
                  <div className="col-12">
                    <label className="form-label small fw-semibold text-dark">Experiencia Previa o Certificaciones (Opcional)</label>
                    <textarea
                      name="observaciones"
                      rows="3"
                      className="form-control form-control-sm"
                      placeholder="Detalla si tienes experiencia previa en plantas de salmón, cursos OS-10, matrículas de buzo, licencia D para grúa horquilla o turnos de faena..."
                      value={formData.observaciones}
                      onChange={handleChange}
                    ></textarea>
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                  <Link to="/" className="text-decoration-none small text-muted">
                    Cancelar
                  </Link>
                  <button type="submit" className="btn btn-primary px-4 fw-semibold py-2 d-flex align-items-center gap-2">
                    <i className="bi bi-send-check"></i>
                    <span>Confirmar y Enviar Postulación</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-auto border-top border-secondary">
        <div className="container d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 text-center text-sm-start text-muted small">
          <div>
            <strong className="text-white">AquaChile S.A.</strong> · Sistema Centralizado de Selección
          </div>
          <div className="text-secondary">
            Postulaciones directas de la Macrozona Sur
          </div>
        </div>
      </footer>
    </div>
  );
}