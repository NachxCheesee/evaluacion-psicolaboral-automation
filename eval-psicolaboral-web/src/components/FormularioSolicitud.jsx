import { useState } from "react";
import { FAMILIAS_CARGO } from "../data/mockData";

export default function FormularioSolicitud({ onAgregarSolicitud, usuarioActual }) {
  const [rut, setRut] = useState("");
  const [candidato, setCandidato] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [cargo, setCargo] = useState("");
  const [familiaCargo, setFamiliaCargo] = useState(FAMILIAS_CARGO[0]);
  const [observaciones, setObservaciones] = useState("");
  const [archivoCV, setArchivoCV] = useState(null);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArchivoCV(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!rut.trim() || !candidato.trim() || !correo.trim() || !cargo.trim()) {
      setError("Por favor completa los campos obligatorios: RUT, Candidato, Correo y Cargo.");
      setExito(false);
      return;
    }

    if (!correo.includes("@")) {
      setError("Ingresa un correo electrónico válido.");
      setExito(false);
      return;
    }

    const nuevaSolicitud = {
      id: Date.now(),
      rut: rut.trim(),
      candidato: candidato.trim(),
      correo: correo.trim(),
      telefono: telefono.trim() || "No registrado",
      direccion: direccion.trim() || "No informada",
      cargo: cargo.trim(),
      familiaCargo,
      solicitadoPor: usuarioActual?.nombre || "Analista AquaChile",
      cvAdjunto: archivoCV ? archivoCV.name : "Sin archivo adjunto",
      fechaSolicitud: new Date().toISOString().split("T")[0],
      responsable: "María Victoria Bustamante",
      estado: "Pendiente",
      observaciones: observaciones.trim() || "Sin observaciones iniciales.",
      evaluacion: {
        fechaEntrevista: "",
        resultado: "",
        observacionesEvaluador: "",
        archivoTranscripcion: "",
        archivoInformeFinal: ""
      }
    };

    onAgregarSolicitud(nuevaSolicitud);

    // Limpiar campos
    setRut("");
    setCandidato("");
    setCorreo("");
    setTelefono("");
    setDireccion("");
    setCargo("");
    setObservaciones("");
    setArchivoCV(null);
    setError("");
    setExito(true);

    const fileInput = document.getElementById("inputCV");
    if (fileInput) fileInput.value = "";

    setTimeout(() => setExito(false), 3500);
  };

  return (
    <div className="card-aquachile p-4 mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-semibold mb-0" style={{ color: "var(--aqua-text-dark)" }}>
          Nueva Solicitud de Evaluación Psicolaboral
        </h5>
        <span className="badge bg-light text-muted border">
          Emisor: {usuarioActual?.nombre}
        </span>
      </div>

      {error && <div className="alert alert-danger py-2 small border-0">{error}</div>}
      {exito && <div className="alert alert-success py-2 small border-0">¡Solicitud y RUT registrados con éxito!</div>}

      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-12 col-md-4">
          <label className="form-label small fw-semibold text-muted text-uppercase">RUT del Candidato *</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ej: 12.345.678-9"
            required
            value={rut}
            onChange={(e) => setRut(e.target.value)}
          />
        </div>

        <div className="col-12 col-md-8">
          <label className="form-label small fw-semibold text-muted text-uppercase">Nombre del Candidato *</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ej: Marcelo Gómez"
            required
            value={candidato}
            onChange={(e) => setCandidato(e.target.value)}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label small fw-semibold text-muted text-uppercase">Correo Electrónico *</label>
          <input
            type="email"
            className="form-control"
            placeholder="ejemplo@aquachile.cl"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label small fw-semibold text-muted text-uppercase">Teléfono</label>
          <input
            type="text"
            className="form-control"
            placeholder="+56 9 1234 5678"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>

        <div className="col-12">
          <label className="form-label small fw-semibold text-muted text-uppercase">Dirección de Residencia</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ej: Av. Diego Portales 1500, Puerto Montt"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label small fw-semibold text-muted text-uppercase">Familia de Cargo *</label>
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
          <label className="form-label small fw-semibold text-muted text-uppercase">Nombre del Cargo *</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ej: Operador de Planta"
            required
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label small fw-semibold text-muted text-uppercase">
            Currículum Vitae (PDF o Word)
          </label>
          <input
            id="inputCV"
            type="file"
            className="form-control"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
          {archivoCV && (
            <small className="text-muted d-block mt-1" style={{ fontSize: "0.78rem" }}>
              Seleccionado: <strong>{archivoCV.name}</strong>
            </small>
          )}
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label small fw-semibold text-muted text-uppercase">Observaciones Iniciales</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ubicación de planta o especificaciones..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        <div className="col-12 text-end pt-2">
          <button type="submit" className="btn btn-aqua-cta">
            Ingresar Solicitud
          </button>
        </div>
      </form>
    </div>
  );
}