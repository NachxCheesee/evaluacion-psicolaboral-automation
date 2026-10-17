import { useState } from "react";

export default function FormularioUsuario({ onAgregarUsuario, cuentas }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("123");
  const [rol, setRol] = useState("ANALISTA");
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nombre.trim() || !correo.trim()) {
      setError("Por favor completa el nombre y el correo.");
      setExito(false);
      return;
    }

    if (!correo.includes("@")) {
      setError("Ingresa un correo electrónico válido.");
      setExito(false);
      return;
    }

    const yaExiste = cuentas.some(
      (c) => c.correo.toLowerCase() === correo.trim().toLowerCase()
    );

    if (yaExiste) {
      setError("Este correo electrónico ya está registrado en la base de datos.");
      setExito(false);
      return;
    }

    const nuevoUsuario = {
      id: Date.now(),
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      password: password.trim() || "123",
      rol,
      tituloRol:
        rol === "ANALISTA"
          ? "Analista de Reclutamiento"
          : rol === "EVALUADOR"
          ? "Profesional Evaluador"
          : "Administrador de Sistemas",
      fechaAlta: new Date().toISOString().split("T")[0]
    };

    onAgregarUsuario(nuevoUsuario);

    setNombre("");
    setCorreo("");
    setPassword("123");
    setError("");
    setExito(true);

    setTimeout(() => setExito(false), 3000);
  };

  return (
    <div className="card-aquachile p-4 mb-4">
      <h5 className="fw-semibold mb-3" style={{ color: "var(--aqua-text-dark)" }}>
        Registrar Nuevo Usuario Corporativo
      </h5>

      {error && <div className="alert alert-danger py-2 small border-0">{error}</div>}
      {exito && <div className="alert alert-success py-2 small border-0">¡Usuario institucional creado con éxito!</div>}

      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-12 col-md-4">
          <label className="form-label small fw-semibold text-muted text-uppercase">Nombre Completo *</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ej: Sebastián Vargas"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="col-12 col-md-4">
          <label className="form-label small fw-semibold text-muted text-uppercase">Correo Institucional *</label>
          <input
            type="email"
            className="form-control"
            placeholder="svargas@aquachile.cl"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>

        <div className="col-12 col-md-2">
          <label className="form-label small fw-semibold text-muted text-uppercase">Rol de Acceso *</label>
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

        <div className="col-12 col-md-2">
          <label className="form-label small fw-semibold text-muted text-uppercase">Contraseña</label>
          <input
            type="text"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="col-12 text-end pt-2">
          <button type="submit" className="btn btn-aqua-cta">
            Guardar Usuario
          </button>
        </div>
      </form>
    </div>
  );
}