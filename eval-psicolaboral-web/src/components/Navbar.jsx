export default function Navbar({ usuarioActual, onCerrarSesion }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-aquachile px-4 py-3 mb-4 sticky-top">
      <div className="container-fluid">
        <div className="d-flex align-items-baseline gap-2">
          <span className="fw-semibold fs-5" style={{ color: "var(--aqua-text-dark)", letterSpacing: "0.5px" }}>
            AquaChile
          </span>
          <span className="text-muted small d-none d-sm-inline">
            | Evaluaciones Psicolaborales
          </span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="text-end d-none d-md-block">
            <div className="fw-semibold small" style={{ color: "var(--aqua-text-dark)" }}>
              {usuarioActual.nombre}
            </div>
            <small className="text-muted" style={{ fontSize: "0.75rem" }}>
              {usuarioActual.tituloRol}
            </small>
          </div>

          <span className="badge rounded-pill bg-light text-dark border px-2 py-1 small">
            {usuarioActual.rol}
          </span>

          <button
            onClick={onCerrarSesion}
            className="btn btn-sm btn-outline-secondary"
            style={{ fontSize: "0.8rem", borderRadius: "2px" }}
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}