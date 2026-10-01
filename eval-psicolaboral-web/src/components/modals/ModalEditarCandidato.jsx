import { useState, useEffect } from "react";
import { FAMILIAS_CARGO } from "../../data/mockData";

export default function ModalEditarCandidato({ solicitud, onGuardar, onCerrar }) {
  const [rut, setRut] = useState("");
  const [candidato, setCandidato] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [cargo, setCargo] = useState("");
  const [familiaCargo, setFamiliaCargo] = useState(FAMILIAS_CARGO[0]);
  const [observaciones, setObservaciones] = useState("");
  const [cvActual, setCvActual] = useState("");
  const [nuevoCV, setNuevoCV] = useState(null);

  useEffect(() => {
    if (solicitud) {
      setRut(solicitud.rut || "");
      setCandidato(solicitud.candidato || "");
      setCorreo(solicitud.correo || "");
      setTelefono(solicitud.telefono || "");
      setDireccion(solicitud.direccion || "");
      setCargo(solicitud.cargo || "");
      setFamiliaCargo(solicitud.familiaCargo || FAMILIAS_CARGO[0]);
      setObservaciones(solicitud.observaciones || "");
      setCvActual(solicitud.cvAdjunto || "Sin archivo adjunto");
    }
  }, [solicitud]);

  if (!solicitud) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar({
      ...solicitud,
      rut: rut.trim(),
      candidato: candidato.trim(),
      correo: correo.trim(),
      telefono: telefono.trim(),
      direccion: direccion.trim(),
      cargo: cargo.trim(),
      familiaCargo,
      cvAdjunto: nuevoCV ? nuevoCV.name : cvActual,
      observaciones: observaciones.trim()
    });
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(30,45,56,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content card-aquachile border-0 shadow-lg">
          <div className="modal-header border-bottom py-3">
            <h5 className="modal-title fs-6 fw-bold" style={{ color: "var(--aqua-text-dark)" }}>
              Editar Antecedentes del Candidato
            </h5>
            <button type="button" className="btn-close" onClick={onCerrar}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body py-3">
              <div className="row g-2 mb-3">
                <div className="col-12 col-md-5">
                  <label className="form-label small fw-semibold text-muted">RUT *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-7">
                  <label className="form-label small fw-semibold text-muted">Nombre del Candidato *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={candidato}
                    onChange={(e) => setCandidato(e.target.value)}
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-muted">Correo Electrónico *</label>
                  <input
                    type="email"
                    className="form-control"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-muted">Teléfono</label>
                  <input
                    type="text"
                    className="form-control"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Dirección de Residencia</label>
                <input
                  type="text"
                  className="form-control"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-muted">Familia de Cargo *</label>
                  <select
                    className="form-select"
                    value={familiaCargo}
                    onChange={(e) => setFamiliaCargo(e.target.value)}
                  >
                    {FAMILIAS_CARGO.map((fam) => (
                      <option key={fam} value={fam}>{fam}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-muted">Nombre del Cargo *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Documento CV Adjunto</label>
                <div className="small text-muted mb-2">
                  Actual: <span className="fw-semibold text-dark">{cvActual}</span>
                </div>
                <input
                  type="file"
                  className="form-control form-control-sm"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setNuevoCV(e.target.files[0]);
                    }
                  }}
                />
                {nuevoCV && (
                  <small className="text-success d-block mt-1" style={{ fontSize: "0.78rem" }}>
                    Reemplazar por: <strong>{nuevoCV.name}</strong>
                  </small>
                )}
              </div>

              <div className="mb-2">
                <label className="form-label small fw-semibold text-muted">Observaciones Generales</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="modal-footer border-top py-2">
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onCerrar}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-sm btn-aqua-cta px-3">
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}