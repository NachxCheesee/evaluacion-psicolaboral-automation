import { useState } from "react";

// Función utilitaria para normalizar RUTs (remueve puntos, guiones y pasa a minúscula)
const normalizarRut = (texto) => {
  if (!texto) return "";
  return texto.toString().replace(/[^0-9kK]/g, "").toLowerCase();
};

export default function TablaSolicitudes({
  solicitudes,
  rolActual,
  onAbrirDetalle,
  onAbrirEdicion,
  onAbrirEvaluacion,
  onSolicitarEliminar
}) {
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [criterioOrden, setCriterioOrden] = useState("fechaDesc");

  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 5;

  // Filtrado inteligente: soporta búsqueda textual directa y RUT sin formato
  const solicitudesFiltradas = solicitudes.filter((sol) => {
    const coincideEstado = filtroEstado === "TODOS" || sol.estado === filtroEstado;
    
    const textoBuscado = busqueda.toLowerCase().trim();
    const rutBuscadoLimpio = normalizarRut(busqueda);
    const rutCandidatoLimpio = normalizarRut(sol.rut);

    const coincideTexto =
      sol.candidato.toLowerCase().includes(textoBuscado) ||
      sol.cargo.toLowerCase().includes(textoBuscado) ||
      (sol.solicitadoPor && sol.solicitadoPor.toLowerCase().includes(textoBuscado)) ||
      (sol.direccion && sol.direccion.toLowerCase().includes(textoBuscado)) ||
      // Búsqueda por RUT con formato tal cual lo escribe
      (sol.rut && sol.rut.toLowerCase().includes(textoBuscado)) ||
      // Búsqueda por RUT sin puntos ni guion (ej: escribir 18342 y encontrar 18.342.195-2)
      (rutBuscadoLimpio.length > 0 && rutCandidatoLimpio.includes(rutBuscadoLimpio));

    return coincideEstado && coincideTexto;
  });

  const solicitudesOrdenadas = [...solicitudesFiltradas].sort((a, b) => {
    if (criterioOrden === "fechaDesc") return new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud);
    if (criterioOrden === "fechaAsc") return new Date(a.fechaSolicitud) - new Date(b.fechaSolicitud);
    if (criterioOrden === "nombreAsc") return a.candidato.localeCompare(b.candidato);
    if (criterioOrden === "nombreDesc") return b.candidato.localeCompare(a.candidato);
    return 0;
  });

  const totalPaginas = Math.ceil(solicitudesOrdenadas.length / elementosPorPagina) || 1;
  const indiceInicio = (paginaActual - 1) * elementosPorPagina;
  const solicitudesPaginadas = solicitudesOrdenadas.slice(indiceInicio, indiceInicio + elementosPorPagina);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const getBadgeClass = (estado) => {
    switch (estado) {
      case "Pendiente": return "badge-pendiente";
      case "En proceso": return "badge-proceso";
      case "Finalizada": return "badge-finalizada";
      default: return "bg-secondary text-white";
    }
  };

  const tienePermisoGestion = rolActual === "EVALUADOR" || rolActual === "ADMIN";

  return (
    <div className="card-aquachile p-4">
      {/* Barra superior con Buscador, Filtro de Estado y Ordenamiento */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-3">
        <div>
          <h5 className="fw-semibold mb-0" style={{ color: "var(--aqua-text-dark)" }}>
            Listado de Evaluaciones Psicolaborales
          </h5>
          <small className="text-muted">
            {rolActual === "ADMIN"
              ? "Modo Administrador: Supervisión global y gestión sin restricciones"
              : rolActual === "ANALISTA"
              ? "Modo Analista: Consulta de ficha y seguimiento de solicitudes"
              : "Modo Evaluador: Agendamiento de entrevistas, calificación y gestión"}
          </small>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ width: "220px" }}
            placeholder="Buscar candidato o RUT..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />

          <select
            className="form-select form-select-sm"
            style={{ width: "140px" }}
            value={filtroEstado}
            onChange={(e) => {
              setFiltroEstado(e.target.value);
              setPaginaActual(1);
            }}
          >
            <option value="TODOS">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En proceso">En proceso</option>
            <option value="Finalizada">Finalizada</option>
          </select>

          <div className="d-flex align-items-center gap-1">
            <span className="small text-muted fw-semibold d-none d-md-inline">Ordenar:</span>
            <select
              className="form-select form-select-sm"
              style={{ width: "180px" }}
              value={criterioOrden}
              onChange={(e) => setCriterioOrden(e.target.value)}
            >
              <option value="fechaDesc">📅 Fecha: Más reciente</option>
              <option value="fechaAsc">📅 Fecha: Más antigua</option>
              <option value="nombreAsc">🔤 Nombre: A - Z</option>
              <option value="nombreDesc">🔤 Nombre: Z - A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla con datos paginados */}
      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead className="table-light text-uppercase small text-muted">
            <tr>
              <th>Candidato</th>
              <th>Cargo / Familia</th>
              <th>Ingresado Por</th>
              <th>Estado</th>
              <th>Entrevista / Informe</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {solicitudesPaginadas.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4 text-muted">
                  No se encontraron solicitudes registradas con ese criterio.
                </td>
              </tr>
            ) : (
              solicitudesPaginadas.map((sol) => (
                <tr key={sol.id}>
                  <td>
                    <div className="fw-semibold text-dark">{sol.candidato}</div>
                    <small className="fw-semibold" style={{ color: "var(--aqua-slate)", fontSize: "0.8rem" }}>
                      RUT: {sol.rut || "Sin RUT"}
                    </small>
                  </td>
                  <td>
                    <div>{sol.cargo}</div>
                    <small className="text-muted">{sol.familiaCargo}</small>
                  </td>
                  <td>
                    <div className="small fw-semibold">{sol.solicitadoPor || "No registrado"}</div>
                    <small className="text-muted">{sol.fechaSolicitud}</small>
                  </td>
                  <td>
                    <span className={`badge px-2 py-1 ${getBadgeClass(sol.estado)}`}>
                      {sol.estado}
                    </span>
                  </td>
                  <td>
                    {sol.evaluacion?.fechaEntrevista ? (
                      <div>
                        <div className="small fw-semibold text-dark">
                          📅 {sol.evaluacion.fechaEntrevista}
                        </div>
                        <small className="text-muted d-block" style={{ fontSize: "0.78rem" }}>
                          {sol.estado === "Finalizada"
                            ? `Resultado: ${sol.evaluacion.resultado}`
                            : "Entrevista agendada"}
                        </small>
                      </div>
                    ) : (
                      <span className="text-muted small fst-italic">
                        Sin entrevista agendada
                      </span>
                    )}
                  </td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-secondary"
                        title="Ver ficha completa"
                        onClick={() => onAbrirDetalle(sol)}
                      >
                        Ver
                      </button>

                      {tienePermisoGestion && (
                        <>
                          <button
                            className="btn btn-outline-secondary"
                            title="Modificar antecedentes o RUT"
                            onClick={() => onAbrirEdicion(sol)}
                          >
                            Editar
                          </button>
                          <button
                            className="btn btn-aqua-outline"
                            title="Agendar entrevista o calificar"
                            onClick={() => onAbrirEvaluacion(sol)}
                          >
                            Evaluar
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            title="Eliminar registro"
                            onClick={() => onSolicitarEliminar(sol)}
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de Paginación */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center pt-3 mt-2 border-top gap-2">
        <small className="text-muted">
          Mostrando {solicitudesPaginadas.length} de {solicitudesOrdenadas.length} registros (Página {paginaActual} de {totalPaginas})
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