import { useState, useEffect } from "react";

export default function ModalEvaluacion({ solicitud, onGuardarEvaluacion, onCerrar }) {
  const [fechaEntrevista, setFechaEntrevista] = useState("");
  const [estado, setEstado] = useState("Pendiente");
  const [resultado, setResultado] = useState("En evaluación");
  const [observacionesEvaluador, setObservacionesEvaluador] = useState("");
  
  const [transcripcionActual, setTranscripcionActual] = useState("");
  const [informeActual, setInformeActual] = useState("");
  const [nuevaTranscripcion, setNuevaTranscripcion] = useState(null);
  const [nuevoInforme, setNuevoInforme] = useState(null);

  useEffect(() => {
    if (solicitud) {
      setFechaEntrevista(solicitud.evaluacion?.fechaEntrevista || "");
      setEstado(solicitud.estado || "Pendiente");
      setResultado(solicitud.evaluacion?.resultado || "En evaluación");
      setObservacionesEvaluador(solicitud.evaluacion?.observacionesEvaluador || "");
      setTranscripcionActual(solicitud.evaluacion?.archivoTranscripcion || "");
      setInformeActual(solicitud.evaluacion?.archivoInformeFinal || "");
    }
  }, [solicitud]);

  if (!solicitud) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    onGuardarEvaluacion(solicitud.id, {
      estado,
      evaluacion: {
        fechaEntrevista,
        resultado: estado === "Pendiente" ? "" : resultado,
        observacionesEvaluador: observacionesEvaluador.trim(),
        archivoTranscripcion: nuevaTranscripcion ? nuevaTranscripcion.name : transcripcionActual,
        archivoInformeFinal: nuevoInforme ? nuevoInforme.name : informeActual
      }
    });
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(30,45,56,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content card-aquachile border-0 shadow-lg">
          <div className="modal-header border-bottom py-3">
            <div>
              <small className="text-uppercase fw-semibold" style={{ color: "var(--aqua-salmon)", fontSize: "0.75rem" }}>
                Gestión de Evaluación Psicolaboral
              </small>
              <h5 className="modal-title fs-6 fw-bold mb-0" style={{ color: "var(--aqua-text-dark)" }}>
                {solicitud.candidato} ({solicitud.rut || "Sin RUT"}) — {solicitud.cargo}
              </h5>
            </div>
            <button type="button" className="btn-close" onClick={onCerrar}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body py-3">
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-muted text-uppercase">
                    Fecha de Entrevista *
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    value={fechaEntrevista}
                    onChange={(e) => {
                      setFechaEntrevista(e.target.value);
                      if (estado === "Pendiente" && e.target.value) {
                        setEstado("En proceso");
                      }
                    }}
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-muted text-uppercase">
                    Estado del Proceso *
                  </label>
                  <select
                    className="form-select fw-semibold"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                  >
                    <option value="Pendiente">Pendiente (Sin agendar)</option>
                    <option value="En proceso">En proceso (Entrevista agendada)</option>
                    <option value="Finalizada">Finalizada (Evaluación completada)</option>
                  </select>
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-muted text-uppercase">
                    Resultado Psicolaboral
                  </label>
                  <select
                    className="form-select"
                    disabled={estado === "Pendiente"}
                    value={resultado}
                    onChange={(e) => setResultado(e.target.value)}
                  >
                    {estado === "En proceso" && <option value="En evaluación">En evaluación / Pendiente</option>}
                    <option value="Recomendable">Recomendable</option>
                    <option value="Recomendable con observaciones">Recomendable con obs.</option>
                    <option value="No recomendable">No recomendable</option>
                  </select>
                </div>
              </div>

              <div className="p-3 mb-3 rounded bg-light border">
                <small className="text-uppercase fw-semibold text-muted d-block mb-2" style={{ fontSize: "0.75rem" }}>
                  Documentación del Proceso (Simulación de Archivos)
                </small>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-muted">
                      1. Transcripción / Pauta de Entrevista (.docx, .pdf)
                    </label>
                    {transcripcionActual && (
                      <div className="small text-muted mb-1 text-truncate">
                        Actual: <strong>{transcripcionActual}</strong>
                      </div>
                    )}
                    <input
                      type="file"
                      className="form-control form-control-sm"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNuevaTranscripcion(e.target.files[0]);
                        }
                      }}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold text-muted">
                      2. Informe Psicolaboral Final (.pdf)
                    </label>
                    {informeActual && (
                      <div className="small text-muted mb-1 text-truncate">
                        Actual: <strong>{informeActual}</strong>
                      </div>
                    )}
                    <input
                      type="file"
                      className="form-control form-control-sm"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNuevoInforme(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-semibold text-muted text-uppercase">
                  Conclusiones y Observaciones del Informe
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Detallar fortalezas, aspectos a considerar y fundamentación del resultado..."
                  value={observacionesEvaluador}
                  onChange={(e) => setObservacionesEvaluador(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer border-top py-2">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onCerrar}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-sm btn-aqua-cta px-3">
                Guardar Evaluación y Archivos
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}