import { useState } from "react";

export default function ModalGestionUsuarios({ cuentas, onCrearUsuario, onCerrar }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("ANALISTA");
  const [password, setPassword] = useState("123");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nombre.trim() || !correo.trim()) {
      setMensaje("Por favor completa el nombre y el correo.");
      return;
    }

    if (!correo.includes("@")) {
      setMensaje("Ingresa un formato de correo válido.");
      return;
    }

    const yaExiste = cuentas.some(
      (c) => c.correo.toLowerCase() === correo.trim().toLowerCase()
    );

    if (yaExiste) {
      setMensaje("Ese correo ya se encuentra registrado en el sistema.");
      return;
    }

    const nuevoUsuario = {
      nombre: nombre.trim(),
      correo: correo.trim(),
      password: password.trim() || "123",
      rol,
      tituloRol:
        rol === "ANALISTA"
          ? "Analista de Reclutamiento"
          : rol === "EVALUADOR"
          ? "Profesional Evaluador"
          : "Administrador de Sistemas"
    };

    onCrearUsuario(nuevoUsuario);
    setNombre("");
    setCorreo("");
    setPassword("123");
    setMensaje("¡Usuario creado exitosamente!");
    setTimeout(() => setMensaje(""), 3000);
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(30,45,56,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content card-aquachile border-0 shadow-lg">
          <div className="modal-header border-bottom py-3">
            <div>
              <small className="text-uppercase fw-semibold" style={{ color: "var(--aqua-salmon)", fontSize: "0.75rem" }}>
                Panel de Administración
              </small>
              <h5 className="modal-title fs-5 fw-bold mb-0" style={{ color: "var(--aqua-text-dark)" }}>
                Gestión de Usuarios y Accesos Institucionales
              </h5>
            </div>
            <button type="button" className="btn-close" onClick={onCerrar}></button>
          </div>

          <div className="modal-body py-4">
            {mensaje && (
              <div className={`alert py-2 small border-0 ${mensaje.includes("exitosamente") ? "alert-success" : "alert-danger"}`}>
                {mensaje}
              </div>
            )}

            {/* Formulario de Alta */}
            <div className="p-3 mb-4 rounded border bg-light">
              <h6 className="fw-bold mb-3" style={{ color: "var(--aqua-text-dark)" }}>
                Crear Nuevo Acceso Corporativo
              </h6>
              <form onSubmit={handleSubmit} className="row g-2">
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-muted">Nombre Completo *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Ej: Juan Pérez"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold text-muted">Correo Institucional *</label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    placeholder="jperez@aquachile.cl"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                  />
                </div>

                <div className="col-12 col-md-2">
                  <label className="form-label small fw-semibold text-muted">Rol *</label>
                  <select
                    className="form-select form-select-sm"
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                  >
                    <option value="ANALISTA">Analista</option>
                    <option value="EVALUADOR">Evaluador</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div className="col-12 col-md-2 d-flex align-items-end">
                  <button type="submit" className="btn btn-sm btn-aqua-cta w-100 py-1">
                    + Registrar
                  </button>
                </div>
              </form>
            </div>

            {/* Listado de Cuentas */}
            <h6 className="fw-bold mb-2" style={{ color: "var(--aqua-text-dark)" }}>
              Cuentas Habilitadas ({cuentas.length})
            </h6>
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead className="table-light small text-muted text-uppercase">
                  <tr>
                    <th>Usuario</th>
                    <th>Correo</th>
                    <th>Rol Asignado</th>
                    <th>Clave Demo</th>
                  </tr>
                </thead>
                <tbody>
                  {cuentas.map((c, idx) => (
                    <tr key={idx}>
                      <td className="fw-semibold">{c.nombre}</td>
                      <td className="small text-muted">{c.correo}</td>
                      <td>
                        <span className={`badge px-2 py-1 ${
                          c.rol === "ADMIN" 
                            ? "bg-dark text-white" 
                            : c.rol === "EVALUADOR" 
                            ? "badge-proceso" 
                            : "badge-pendiente"
                        }`}>
                          {c.tituloRol || c.rol}
                        </span>
                      </td>
                      <td><code className="text-muted">{c.password}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="modal-footer border-top py-2">
            <button type="button" className="btn btn-sm btn-outline-secondary px-3" onClick={onCerrar}>
              Cerrar Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}