export default function ModalVerDetalle({ solicitud, onCerrar }) {
  if (!solicitud) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(30,45,56,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content card-aquachile border-0 shadow-lg">
          <div className="modal-header border-bottom py-3">
            <div>
              <small className="text-uppercase fw-semibold" style={{ color: "var(--aqua-salmon)", fontSize: "0.75rem" }}>
                Expediente Consolidado del Postulante
              </small>
              <h5 className="modal-title fs-5 fw-bold mb-0" style={{ color: "var(--aqua-text-dark)" }}>
                {solicitud.candidato}
                <span className="badge bg-light text-secondary border fw-normal fs-6 ms-2">
                  RUT: {solicitud.rut || "Sin RUT"}
                </span>
              </h5>
            </div>
            <button type="button" className="btn-close" onClick={onCerrar}></button>
          </div>

          <div className="modal-body py-4">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <small className="text-muted text-uppercase fw-semibold d-block">Cargo y Familia</small>
                <span className="fw-semibold text-dark">{solicitud.cargo}</span>
                <span className="text-muted d-block small">{solicitud.familiaCargo}</span>
              </div>

              <div className="col-12 col-md-6">
                <small className="text-muted text-uppercase fw-semibold d-block">Estado Actual</small>
                <span className="badge px-2 py-1 mt-1 bg-secondary text-white">
                  {solicitud.estado}
                </span>
              </div>

              <div className="col-12 col-md-6">
                <small className="text-muted text-uppercase fw-semibold d-block">Contacto</small>
                <div>{solicitud.correo}</div>
                <div className="text-muted small">{solicitud.telefono}</div>
              </div>

              <div className="col-12 col-md-6">
                <small className="text-muted text-uppercase fw-semibold d-block">Dirección de Residencia</small>
                <span className="text-dark">{solicitud.direccion || "No informada"}</span>
              </div>

              <div className="col-12 col-md-6">
                <small className="text-muted text-uppercase fw-semibold d-block">Ingresado Por</small>
                <span>{solicitud.solicitadoPor}</span>
                <small className="text-muted d-block">Fecha Solicitud: {solicitud.fechaSolicitud}</small>
              </div>

              <div className="col-12 col-md-6">
                <small className="text-muted text-uppercase fw-semibold d-block">Evaluador Asignado</small>
                <span>{solicitud.responsable}</span>
              </div>

              {/* SECCIÓN DOCUMENTAL: BOTONES EXPLÍCITOS DE DESCARGA */}
              <div className="col-12">
                <div className="p-3 rounded border bg-light">
                  <small className="text-muted text-uppercase fw-bold d-block mb-3" style={{ fontSize: "0.75rem" }}>
                    Expediente Documental Adjunto (Descarga Directa)
                  </small>
                  
                  <div className="row g-3">
                    {/* 1. CV */}
                    <div className="col-12 col-md-4">
                      <div className="p-3 border rounded bg-white h-100 d-flex flex-column justify-content-between shadow-sm">
                        <div>
                          <small className="text-muted text-uppercase fw-bold d-block" style={{ fontSize: "0.7rem" }}>
                            Currículum Vitae
                          </small>
                          <div className="text-dark small fw-semibold text-truncate my-1" title={solicitud.cvAdjunto}>
                            📄 {solicitud.cvAdjunto || "Sin archivo"}
                          </div>
                        </div>

                        {solicitud.cvAdjunto && solicitud.cvAdjunto !== "Sin archivo adjunto" ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary w-100 mt-2 fw-semibold"
                            style={{ fontSize: "0.8rem", borderRadius: "3px" }}
                            onClick={() => alert(`Simulación: Descargando CV "${solicitud.cvAdjunto}"...`)}
                          >
                            ⬇ Descargar CV
                          </button>
                        ) : (
                          <button disabled className="btn btn-sm btn-light border text-muted w-100 mt-2" style={{ fontSize: "0.8rem" }}>
                            No disponible
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 2. Transcripción */}
                    <div className="col-12 col-md-4">
                      <div className="p-3 border rounded bg-white h-100 d-flex flex-column justify-content-between shadow-sm">
                        <div>
                          <small className="text-muted text-uppercase fw-bold d-block" style={{ fontSize: "0.7rem" }}>
                            Transcripción Entrevista
                          </small>
                          <div className="text-dark small fw-semibold text-truncate my-1" title={solicitud.evaluacion?.archivoTranscripcion}>
                            📝 {solicitud.evaluacion?.archivoTranscripcion || "Sin transcripción"}
                          </div>
                        </div>

                        {solicitud.evaluacion?.archivoTranscripcion ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary w-100 mt-2 fw-semibold"
                            style={{ fontSize: "0.8rem", borderRadius: "3px" }}
                            onClick={() => alert(`Simulación: Descargando transcripción "${solicitud.evaluacion.archivoTranscripcion}"...`)}
                          >
                            ⬇ Descargar Pauta
                          </button>
                        ) : (
                          <button disabled className="btn btn-sm btn-light border text-muted w-100 mt-2" style={{ fontSize: "0.8rem" }}>
                            Pendiente
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 3. Informe Final */}
                    <div className="col-12 col-md-4">
                      <div className="p-3 border rounded bg-white h-100 d-flex flex-column justify-content-between shadow-sm">
                        <div>
                          <small className="text-muted text-uppercase fw-bold d-block" style={{ fontSize: "0.7rem" }}>
                            Informe Psicolaboral
                          </small>
                          <div className="text-dark small fw-semibold text-truncate my-1" title={solicitud.evaluacion?.archivoInformeFinal}>
                            📊 {solicitud.evaluacion?.archivoInformeFinal || "Sin informe"}
                          </div>
                        </div>

                        {solicitud.evaluacion?.archivoInformeFinal ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-aqua-solid w-100 mt-2 fw-semibold"
                            style={{ fontSize: "0.8rem", borderRadius: "3px" }}
                            onClick={() => alert(`Simulación: Descargando informe final "${solicitud.evaluacion.archivoInformeFinal}"...`)}
                          >
                            ⬇ Descargar Informe
                          </button>
                        ) : (
                          <button disabled className="btn btn-sm btn-light border text-muted w-100 mt-2" style={{ fontSize: "0.8rem" }}>
                            Sin emitir
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dictamen Psicolaboral */}
              <div className="col-12">
                <div className="p-3 rounded border" style={{ backgroundColor: "#F7F9FA" }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-uppercase fw-bold text-muted" style={{ fontSize: "0.75rem" }}>
                      Dictamen Psicolaboral
                    </small>
                    {solicitud.evaluacion?.fechaEntrevista && (
                      <span className="badge bg-white text-dark border fw-normal">
                        📅 Entrevista: <strong>{solicitud.evaluacion.fechaEntrevista}</strong>
                      </span>
                    )}
                  </div>

                  {solicitud.evaluacion?.resultado ? (
                    <div>
                      <div className="small mb-2">
                        <strong>Resultado Final:</strong>{" "}
                        <span className="badge bg-dark text-white px-2 py-1 ms-1">
                          {solicitud.evaluacion.resultado}
                        </span>
                      </div>
                      <small className="text-muted d-block fw-semibold mb-1">Conclusiones del Informe:</small>
                      <p className="mb-0 text-dark small" style={{ whiteSpace: "pre-wrap" }}>
                        {solicitud.evaluacion.observacionesEvaluador || "Sin observaciones adicionales."}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted small fst-italic">
                      El proceso aún no cuenta con dictamen psicolaboral emitido.
                    </span>
                  )}
                </div>
              </div>

              {/* Observaciones generales */}
              <div className="col-12">
                <div className="p-3 bg-light rounded border">
                  <small className="text-muted text-uppercase fw-semibold d-block mb-1">
                    Observaciones Iniciales del Analista
                  </small>
                  <p className="mb-0 text-dark small" style={{ whiteSpace: "pre-wrap" }}>
                    {solicitud.observaciones || "Sin observaciones registradas."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top py-2">
            <button type="button" className="btn btn-sm btn-outline-secondary px-3" onClick={onCerrar}>
              Cerrar Expediente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}