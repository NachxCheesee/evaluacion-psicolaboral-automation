import { useState, useEffect } from "react";

export default function ModalEditarUsuario({ usuario, onGuardar, onCerrar }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("ANALISTA");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || "");
      setCorreo(usuario.correo || "");
      setRol(usuario.rol || "ANALISTA");
      setPassword(usuario.password || "123");
    }
  }, [usuario]);

  if (!usuario) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar({
      ...usuario,
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      rol,
      password: password.trim() || "123",
      tituloRol:
        rol === "ANALISTA"
          ? "Analista de Reclutamiento"
          : rol === "EVALUADOR"
          ? "Profesional Evaluador"
          : "Administrador de Sistemas"
    });
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(30,45,56,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content card-aquachile border-0 shadow-lg">
          <div className="modal-header border-bottom py-3">
            <h5 className="modal-title fs-6 fw-bold" style={{ color: "var(--aqua-text-dark)" }}>
              Editar Usuario Institucional
            </h5>
            <button type="button" className="btn-close" onClick={onCerrar}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body py-3">
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Nombre Completo *</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Correo Electrónico *</label>
                <input
                  type="email"
                  className="form-control"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                />
              </div>

              <div className="row g-2 mb-2">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-muted">Rol de Acceso *</label>
                  <select
                    className="form-select"
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                  >
                    <option value="ANALISTA">Analista</option>
                    <option value="EVALUADOR">Evaluador</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-muted">Contraseña *</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
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