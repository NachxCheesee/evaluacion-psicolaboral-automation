import { useState } from "react";

export default function TablaUsuarios({
  cuentas,
  usuarioActual,
  onAbrirEdicion,
  onSolicitarEliminar
}) {
  const [filtroRol, setFiltroRol] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [criterioOrden, setCriterioOrden] = useState("fechaDesc");

  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 5;

  const cuentasFiltradas = cuentas.filter((c) => {
    const coincideRol = filtroRol === "TODOS" || c.rol === filtroRol;
    const busq = busqueda.toLowerCase();
    const coincideTexto =
      c.nombre.toLowerCase().includes(busq) ||
      c.correo.toLowerCase().includes(busq) ||
      (c.tituloRol && c.tituloRol.toLowerCase().includes(busq));
    return coincideRol && coincideTexto;
  });

  const cuentasOrdenadas = [...cuentasFiltradas].sort((a, b) => {
    if (criterioOrden === "fechaDesc") return new Date(b.fechaAlta || 0) - new Date(a.fechaAlta || 0);
    if (criterioOrden === "fechaAsc") return new Date(a.fechaAlta || 0) - new Date(b.fechaAlta || 0);
    if (criterioOrden === "nombreAsc") return a.nombre.localeCompare(b.nombre);
    if (criterioOrden === "nombreDesc") return b.nombre.localeCompare(a.nombre);
    return 0;
  });

  const totalPaginas = Math.ceil(cuentasOrdenadas.length / elementosPorPagina) || 1;
  const indiceInicio = (paginaActual - 1) * elementosPorPagina;
  const cuentasPaginadas = cuentasOrdenadas.slice(indiceInicio, indiceInicio + elementosPorPagina);

  const cambiarPagina = (nueva) => {
    if (nueva >= 1 && nueva <= totalPaginas) setPaginaActual(nueva);
  };

  const getBadgeRol = (rol) => {
    switch (rol) {
      case "ADMIN": return "bg-dark text-white";
      case "EVALUADOR": return "badge-proceso";
      case "ANALISTA": return "badge-pendiente";
      default: return "bg-secondary text-white";
    }
  };

  return (
    <div className="card-aquachile p-4 mt-5">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
        <div>
          <h5 className="fw-semibold mb-0" style={{ color: "var(--aqua-text-dark)" }}>
            Gestión de Cuentas y Accesos Institucionales
          </h5>
          <small className="text-muted">
            Administración centralizada de analistas, evaluadores y credenciales de acceso
          </small>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ width: "200px" }}
            placeholder="Buscar por usuario, correo..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />

          <select
            className="form-select form-select-sm"
            style={{ width: "140px" }}
            value={filtroRol}
            onChange={(e) => {
              setFiltroRol(e.target.value);
              setPaginaActual(1);
            }}
          >
            <option value="TODOS">Todos los roles</option>
            <option value="ADMIN">Administrador</option>
            <option value="ANALISTA">Analista</option>
            <option value="EVALUADOR">Evaluador</option>
          </select>

          <div className="d-flex align-items-center gap-1">
            <span className="small text-muted fw-semibold d-none d-md-inline">Ordenar:</span>
            <select
              className="form-select form-select-sm"
              style={{ width: "180px" }}
              value={criterioOrden}
              onChange={(e) => setCriterioOrden(e.target.value)}
            >
              <option value="fechaDesc">📅 Alta: Más reciente</option>
              <option value="fechaAsc">📅 Alta: Más antigua</option>
              <option value="nombreAsc">🔤 Nombre: A - Z</option>
              <option value="nombreDesc">🔤 Nombre: Z - A</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead className="table-light text-uppercase small text-muted">
            <tr>
              <th>Usuario</th>
              <th>Correo Institucional</th>
              <th>Rol / Título</th>
              <th>Fecha de Alta</th>
              <th>Clave Demo</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cuentasPaginadas.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  No se encontraron cuentas registradas.
                </td>
              </tr>
            ) : (
              cuentasPaginadas.map((c) => {
                const esUsuarioActual = c.id === usuarioActual.id;
                return (
                  <tr key={c.id}>
                    <td>
                      <div className="fw-semibold text-dark">
                        {c.nombre}
                        {esUsuarioActual && (
                          <span className="badge bg-light text-dark border ms-2" style={{ fontSize: "0.68rem" }}>
                            Tú
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="text-muted small">{c.correo}</span>
                    </td>
                    <td>
                      <span className={`badge px-2 py-1 ${getBadgeRol(c.rol)}`}>
                        {c.tituloRol || c.rol}
                      </span>
                    </td>
                    <td>
                      <small className="text-muted">{c.fechaAlta || "No registrada"}</small>
                    </td>
                    <td>
                      <code className="text-muted bg-light px-2 py-1 rounded border small">{c.password}</code>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          title="Modificar datos o rol de usuario"
                          onClick={() => onAbrirEdicion(c)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          title={esUsuarioActual ? "No puedes eliminar tu propia cuenta en sesión" : "Eliminar acceso"}
                          disabled={esUsuarioActual}
                          onClick={() => onSolicitarEliminar(c)}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center pt-3 mt-2 border-top gap-2">
        <small className="text-muted">
          Mostrando {cuentasPaginadas.length} de {cuentasOrdenadas.length} usuarios (Página {paginaActual} de {totalPaginas})
        </small>

        <div className="btn-group btn-group-sm">
          <button
            className="btn btn-outline-secondary"
            disabled={paginaActual === 1}
            onClick={() => cambiarPagina(paginaActual - 1)}
          >
            ← Anterior
          </button>
          {[...Array(totalPaginas)].map((_, i) => (
            <button
              key={i + 1}
              className={`btn ${paginaActual === i + 1 ? "btn-secondary text-white" : "btn-outline-secondary"}`}
              onClick={() => cambiarPagina(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="btn btn-outline-secondary"
            disabled={paginaActual === totalPaginas}
            onClick={() => cambiarPagina(paginaActual + 1)}
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}