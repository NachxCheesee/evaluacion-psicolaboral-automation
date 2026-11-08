import React, { useState, useEffect, useRef } from 'react';

export default function ModalEvaluacion({ solicitud, onClose, onCerrar, onGuardarEvaluacion, onGuardar }) {
  const cerrarModal = onClose || onCerrar || (() => {});
  const guardar = onGuardarEvaluacion || onGuardar || (() => {});

  const [fechaEntrevista, setFechaEntrevista] = useState(solicitud?.fechaEntrevista || '');
  const [observacionesEvaluador, setObservacionesEvaluador] = useState(solicitud?.observacionesEvaluador || '');
  const [resultado, setResultado] = useState(solicitud?.resultado || '');
  const [estado, setEstado] = useState(solicitud?.estado || 'En proceso');

  // Archivos del expediente
  const [cvArchivo, setCvArchivo] = useState(solicitud?.cvArchivo || null);
  const [entrevistaArchivo, setEntrevistaArchivo] = useState(solicitud?.entrevistaArchivo || null);
  const [informeArchivo, setInformeArchivo] = useState(solicitud?.informeArchivo || null);

  // Control de menús desplegables (3 puntos)
  const [menuAbierto, setMenuAbierto] = useState(null); // 'cv' | 'pauta' | 'informe' | null

  // Referencias a inputs de archivos ocultos
  const cvInputRef = useRef(null);
  const pautaInputRef = useRef(null);
  const informeInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') cerrarModal();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cerrarModal]);

  if (!solicitud) return null;

  const handleDescargar = (archivo, tipo) => {
    alert(`Descargando ${tipo}: ${archivo}`);
  };

  const toggleMenu = (tipo, e) => {
    e.stopPropagation();
    setMenuAbierto(menuAbierto === tipo ? null : tipo);
  };

  const handleSeleccionArchivo = (tipo, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (tipo === 'cv') setCvArchivo(file.name);
    if (tipo === 'pauta') setEntrevistaArchivo(file.name);
    if (tipo === 'informe') setInformeArchivo(file.name);

    setMenuAbierto(null);
    e.target.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nuevoEstado = resultado ? 'Finalizada' : (fechaEntrevista ? 'En proceso' : estado);

    // Asignación de nombres si dictaminó y no adjuntó archivo manual
    const nombreInformeFinal = informeArchivo || (resultado ? `Informe_Psicolaboral_${solicitud.candidato.replace(/\s+/g, '_')}.pdf` : null);
    const nombrePautaFinal = entrevistaArchivo || (fechaEntrevista ? `Pauta_Entrevista_${solicitud.candidato.replace(/\s+/g, '_')}.pdf` : null);

    guardar({
      ...solicitud,
      cvArchivo: cvArchivo || null,
      fechaEntrevista: fechaEntrevista || null,
      observacionesEvaluador: observacionesEvaluador.trim() || null,
      resultado: resultado || null,
      estado: nuevoEstado,
      informeArchivo: nombreInformeFinal,
      entrevistaArchivo: nombrePautaFinal
    });
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', zIndex: 1055 }}
      onClick={() => {
        setMenuAbierto(null);
        cerrarModal();
      }}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered"
        onClick={(e) => {
          e.stopPropagation();
          setMenuAbierto(null);
        }}
      >
        <div className="modal-content border-0 shadow-lg rounded-3">
          <div className="modal-header bg-light py-3">
            <h5 className="modal-title fw-bold text-primary mb-0">
              <i className="bi bi-clipboard2-pulse me-2"></i>
              Evaluación Psicolaboral & Dictamen Clínico
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
              {/* 1. Resumen del Candidato */}
              <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded-3 border">
                <div>
                  <h6 className="fw-bold mb-1 text-dark">{solicitud.candidato}</h6>
                  <span className="text-muted small">
                    RUT: <strong>{solicitud.rut}</strong> · Cargo: <strong>{solicitud.cargo}</strong>
                  </span>
                </div>
                <div className="d-flex gap-2">
                  <span className={`badge ${solicitud.origen === 'Interno' ? 'bg-primary' : 'bg-secondary'}`}>
                    {solicitud.origen || 'Externo'}
                  </span>
                  <span className="badge bg-dark">{solicitud.estado}</span>
                </div>
              </div>

              {/* 2. Documentos del Expediente (CV, Pauta e Informe con menú de 3 puntos) */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-dark d-flex align-items-center gap-1 mb-2">
                  <i className="bi bi-folder2-open text-primary"></i>
                  <span>Documentación del Expediente</span>
                </label>

                {/* Inputs ocultos activados por el menú */}
                <input
                  type="file"
                  ref={cvInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleSeleccionArchivo('cv', e)}
                />
                <input
                  type="file"
                  ref={pautaInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleSeleccionArchivo('pauta', e)}
                />
                <input
                  type="file"
                  ref={informeInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleSeleccionArchivo('informe', e)}
                />

                <div className="d-flex flex-column gap-2">
                  {/* Tarjeta 1: Currículum Vitae */}
                  <div className="p-2 px-3 bg-white border rounded d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-file-earmark-person text-danger fs-5"></i>
                      <div>
                        <div className="small fw-semibold text-dark">Currículum Vitae (CV)</div>
                        <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
                          {cvArchivo ? cvArchivo : 'Sin CV registrado'}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-1 position-relative">
                      {cvArchivo && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm py-1 px-2"
                          onClick={() => handleDescargar(cvArchivo, 'CV')}
                          title="Descargar archivo"
                        >
                          <i className="bi bi-download me-1"></i>Descargar
                        </button>
                      )}

                      {/* Botón 3 puntos */}
                      <button
                        type="button"
                        className="btn btn-light btn-sm text-secondary px-2 border"
                        onClick={(e) => toggleMenu('cv', e)}
                        title="Opciones de archivo"
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>

                      {menuAbierto === 'cv' && (
                        <div
                          className="dropdown-menu show shadow-sm position-absolute end-0 mt-1 py-1"
                          style={{ top: '100%', zIndex: 1060, minWidth: '170px' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="dropdown-item small py-1"
                            onClick={() => cvInputRef.current.click()}
                          >
                            <i className="bi bi-arrow-repeat me-2 text-primary"></i>
                            {cvArchivo ? 'Reemplazar CV' : 'Adjuntar CV'}
                          </button>
                          {cvArchivo && (
                            <button
                              type="button"
                              className="dropdown-item small py-1 text-danger"
                              onClick={() => {
                                setCvArchivo(null);
                                setMenuAbierto(null);
                              }}
                            >
                              <i className="bi bi-trash me-2"></i>Quitar CV
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tarjeta 2: Pauta de Entrevista */}
                  <div className="p-2 px-3 bg-white border rounded d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-file-earmark-text text-primary fs-5"></i>
                      <div>
                        <div className="small fw-semibold text-dark">Pauta de Entrevista / Test</div>
                        <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
                          {entrevistaArchivo ? entrevistaArchivo : 'Sin pauta adjunta'}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-1 position-relative">
                      {entrevistaArchivo && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm py-1 px-2"
                          onClick={() => handleDescargar(entrevistaArchivo, 'Pauta')}
                          title="Descargar archivo"
                        >
                          <i className="bi bi-download me-1"></i>Descargar
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-light btn-sm text-secondary px-2 border"
                        onClick={(e) => toggleMenu('pauta', e)}
                        title="Opciones de archivo"
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>

                      {menuAbierto === 'pauta' && (
                        <div
                          className="dropdown-menu show shadow-sm position-absolute end-0 mt-1 py-1"
                          style={{ top: '100%', zIndex: 1060, minWidth: '170px' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="dropdown-item small py-1"
                            onClick={() => pautaInputRef.current.click()}
                          >
                            <i className="bi bi-arrow-repeat me-2 text-primary"></i>
                            {entrevistaArchivo ? 'Reemplazar Pauta' : 'Adjuntar Pauta'}
                          </button>
                          {entrevistaArchivo && (
                            <button
                              type="button"
                              className="dropdown-item small py-1 text-danger"
                              onClick={() => {
                                setEntrevistaArchivo(null);
                                setMenuAbierto(null);
                              }}
                            >
                              <i className="bi bi-trash me-2"></i>Quitar Pauta
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tarjeta 3: Informe Psicolaboral Oficial */}
                  <div className="p-2 px-3 bg-white border rounded d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-file-earmark-check text-success fs-5"></i>
                      <div>
                        <div className="small fw-semibold text-dark">Informe Psicolaboral Oficial</div>
                        <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
                          {informeArchivo ? informeArchivo : 'Sin informe emitido'}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-1 position-relative">
                      {informeArchivo && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm py-1 px-2"
                          onClick={() => handleDescargar(informeArchivo, 'Informe')}
                          title="Descargar archivo"
                        >
                          <i className="bi bi-download me-1"></i>Descargar
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-light btn-sm text-secondary px-2 border"
                        onClick={(e) => toggleMenu('informe', e)}
                        title="Opciones de archivo"
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>

                      {menuAbierto === 'informe' && (
                        <div
                          className="dropdown-menu show shadow-sm position-absolute end-0 mt-1 py-1"
                          style={{ top: '100%', zIndex: 1060, minWidth: '170px' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="dropdown-item small py-1"
                            onClick={() => informeInputRef.current.click()}
                          >
                            <i className="bi bi-arrow-repeat me-2 text-primary"></i>
                            {informeArchivo ? 'Reemplazar Informe' : 'Adjuntar Informe'}
                          </button>
                          {informeArchivo && (
                            <button
                              type="button"
                              className="dropdown-item small py-1 text-danger"
                              onClick={() => {
                                setInformeArchivo(null);
                                setMenuAbierto(null);
                              }}
                            >
                              <i className="bi bi-trash me-2"></i>Quitar Informe
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Agendamiento y Dictamen */}
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Fecha de Entrevista Psicolaboral</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={fechaEntrevista}
                    onChange={(e) => setFechaEntrevista(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Dictamen Final</label>
                  <select
                    className="form-select form-select-sm"
                    value={resultado}
                    onChange={(e) => setResultado(e.target.value)}
                  >
                    <option value="">-- Sin dictamen (En evaluación) --</option>
                    <option value="Recomendable">Recomendable (Apto para faena / planta)</option>
                    <option value="Recomendable con Observaciones">Recomendable con Observaciones</option>
                    <option value="No Recomendable">No Recomendable para este cargo</option>
                  </select>
                </div>
              </div>

              {/* 4. Observaciones Clínicas */}
              <div className="mb-2">
                <label className="form-label small fw-semibold">Observaciones Clínicas y Competencias Evaluadas</label>
                <textarea
                  rows="3"
                  className="form-control form-control-sm"
                  placeholder="Detallar apego a normas de seguridad en faena, tolerancia a turnos rotativos en aislamiento, trabajo en equipo y estabilidad emocional..."
                  value={observacionesEvaluador}
                  onChange={(e) => setObservacionesEvaluador(e.target.value)}
                ></textarea>
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
                Guardar Evaluación y Archivos
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}