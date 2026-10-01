import { useState } from "react";

export default function LoginSimulado({ cuentas, onLogin }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!correo.trim() || !password.trim()) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    const usuarioEncontrado = cuentas.find(
      (u) =>
        u.correo.toLowerCase() === correo.trim().toLowerCase() &&
        u.password === password
    );

    if (usuarioEncontrado) {
      setError("");
      onLogin(usuarioEncontrado);
    } else {
      setError("Credenciales incorrectas. Verifica los datos ingresados.");
    }
  };

  const autocompletar = (cuenta) => {
    setCorreo(cuenta.correo);
    setPassword(cuenta.password);
    setError("");
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 py-4">
      <div className="card-aquachile p-4 p-md-5 w-100" style={{ maxWidth: "460px" }}>
        
        <div className="text-center mb-4">
          <small className="text-uppercase fw-semibold d-block mb-1" style={{ color: "var(--aqua-salmon)", letterSpacing: "1.5px" }}>
            Reclutamiento y Selección
          </small>
          <h2 className="fw-semibold mb-1" style={{ color: "var(--aqua-text-dark)", letterSpacing: "-0.5px" }}>
            AquaChile
          </h2>
          <p className="text-muted small">
            Portal de Evaluaciones Psicolaborales
          </p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small mb-3 text-center border-0 shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted text-uppercase">
              Correo Electrónico
            </label>
            <input
              type="email"
              className="form-control form-control-lg fs-6"
              placeholder="nombre@aquachile.cl"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold text-muted text-uppercase">
              Contraseña
            </label>
            <input
              type="password"
              className="form-control form-control-lg fs-6"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-aqua-cta w-100 py-2 fs-6 mb-3">
            Ingresar al Panel
          </button>
        </form>

        <div className="pt-3 border-top text-center">
          <small className="text-muted d-block mb-2 fw-semibold" style={{ fontSize: "0.75rem" }}>
            Acceso rápido para demostración:
          </small>
          <div className="d-flex justify-content-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-2 py-1"
              style={{ fontSize: "0.78rem" }}
              onClick={() => autocompletar(cuentas.find(c => c.rol === "ADMIN") || cuentas[0])}
            >
              Admin
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-2 py-1"
              style={{ fontSize: "0.78rem" }}
              onClick={() => autocompletar(cuentas.find(c => c.rol === "ANALISTA") || cuentas[1])}
            >
              Analista
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-2 py-1"
              style={{ fontSize: "0.78rem" }}
              onClick={() => autocompletar(cuentas.find(c => c.rol === "EVALUADOR") || cuentas[2])}
            >
              Evaluador
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}