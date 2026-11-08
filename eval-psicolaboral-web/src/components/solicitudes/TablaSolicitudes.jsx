import React, { useState } from 'react';

// Quita tildes y pasa a minúsculas para búsquedas flexibles
const normalizarTexto = (texto) => {
  if (!texto) return '';
  return texto
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

// Limpia el RUT dejando solo dígitos y K
const normalizarRut = (texto) => {
  if (!texto) return '';
  return texto.toString().replace(/[^0-9kK]/g, '').toLowerCase().trim();
};

export default function TablaSolicitudes({
  solicitudes = [],
  usuarioActual,
  onVerDetalle,
  onEditar,
  onEvaluar,
  onEliminar
}) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [orden, setOrden] = useState('reciente');
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 5;

  const rol = usuarioActual?.rol || '';

  // Filtrado robusto por nombre, RUT, cargo u origen
  const solicitudesFiltradas = solicitudes.filter((item) => {
    const termino = normalizarTexto(busqueda);
    const terminoRut = normalizarRut(busqueda);

    // Si no hay término de búsqueda escrito, solo filtra por estado
    if (!termino) {
      return filtroEstado === 'Todos' || item.estado === filtroEstado;
    }

    // 1. Búsqueda textual (Nombre, Cargo, Origen)
    const coincideCandidato = normalizarTexto(item.candidato).includes(termino);
    const coincideCargo = normalizarTexto(item.cargo).includes(termino);
    const coincideOrigen = normalizarTexto(item.origen).includes(termino);

    // 2. Búsqueda por RUT (tanto con formato como solo números)
    const rutLimpioItem = normalizarRut(item.rut);
    const coincideRutDirecto = item.rut ? item.rut.toLowerCase().includes(termino) : false;
    // Solo compara por RUT limpio si el usuario realmente ingresó números o 'k'
    const coincideRutLimpio = terminoRut.length > 0 && rutLimpioItem.includes(terminoRut);

    const coincideBusqueda =
      coincideCandidato ||
      coincideCargo ||
      coincideOrigen ||
      coincideRutDirecto ||
      coincideRutLimpio;

    const coincideEstado = filtroEstado === 'Todos' || item.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });

  // Ordenamiento
  const solicitudesOrdenadas = [...solicitudesFiltradas].sort((a, b) => {
    if (orden === 'reciente') return new Date(b.fecha) - new Date(a.fecha);
    if (orden === 'antiguo') return new Date(a.fecha) - new Date(b.fecha);
    if (orden === 'alfabetico') return (a.candidato || '').localeCompare(b.candidato || '');
    return 0;
  });

  // Paginación
  const totalPaginas = Math.ceil(solicitudesOrdenadas.length / elementosPorPagina) || 1;
  const indiceInicio = (paginaActual - 1) * elementosPorPagina;
  const solicitudesPaginadas = solicitudesOrdenadas.slice(indiceInicio, indiceInicio + elementosPorPagina);

  const getBadgeEstado = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-warning text-dark';
      case 'En proceso':
        return 'bg-info text-dark';
      case 'Finalizada':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="card shadow-sm border-0 bg-white rounded-3">
      <div className="card-body p-3">
        {/* Barra de Filtros */}
        <div className="row g-2 mb-3 align-items-center">
          <div className="col-12 col-md-4">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Buscar candidato, RUT o cargo..."
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
            />
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm"
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setPaginaActual(1);
              }}
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En proceso">En proceso</option>
              <option value="Finalizada">Finalizada</option>
            </select>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
            >
              <option value="reciente">Más recientes primero</option>
              <option value="antiguo">Más antiguos primero</option>
              <option value="alfabetico">Alfabético (A-Z)</option>
            </select>
          </div>

          <div className="col-12 col-md-2 text-md-end text-muted small">
            {solicitudesFiltradas.length} postulaciones
          </div>
        </div>

        {/* Tabla */}
        <div className="table-responsive">
          <table className="table table-hover align-middle table-sm mb-0">
            <thead className="table-light">
              <tr>
                <th>Candidato / RUT</th>
                <th>Cargo al que Postula</th>
                <th>Estado</th>
                <th>Entrevista / Informe</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudesPaginadas.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted small">
                    No se encontraron postulaciones que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                solicitudesPaginadas.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="fw-semibold text-dark">{item.candidato}</div>
                      <small className="text-muted">{item.rut}</small>
                    </td>
                    <td className="small text-muted">
                      <div>{item.cargo}</div>
                      <span className={`badge ${item.origen === 'Interno' ? 'bg-primary-subtle text-primary border' : 'bg-light text-secondary border'}`}>
                        {item.origen || 'Externo'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getBadgeEstado(item.estado)}`}>
                        {item.estado}
                      </span>
                    </td>
                    <td className="small">
                      {item.resultado ? (
                        <div className="text-success fw-semibold d-flex align-items-center gap-1">
                          <i className="bi bi-check-circle-fill"></i>
                          <span>{item.resultado}</span>
                        </div>
                      ) : item.fechaEntrevista ? (
                        <div className="text-primary fw-semibold d-flex align-items-center gap-1">
                          <i className="bi bi-calendar-event"></i>
                          <span>{item.fechaEntrevista}</span>
                        </div>
                      ) : (
                        <span className="text-muted fst-italic">
                          Sin entrevista agendada
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        {/* Ver (Todos) */}
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => onVerDetalle(item)}
                          title="Ver Expediente"
                        >
                          Ver
                        </button>

                        {/* Evaluar (ADMIN y EVALUADOR) */}
                        {(rol === 'ADMIN' || rol === 'EVALUADOR') && (
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => onEvaluar(item)}
                            title="Evaluar o agendar"
                          >
                            Evaluar
                          </button>
                        )}

                        {/* Editar (ADMIN, EVALUADOR y ANALISTA) */}
                        {(rol === 'ADMIN' || rol === 'EVALUADOR' || rol === 'ANALISTA') && (
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => onEditar(item)}
                            title="Editar Datos"
                          >
                            Editar
                          </button>
                        )}

                        {/* Borrar (ADMIN y ANALISTA) */}
                        {(rol === 'ADMIN' || rol === 'ANALISTA') && (
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => onEliminar(item)}
                            title="Eliminar Registro"
                          >
                            Borrar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
            <small className="text-muted">
              Página {paginaActual} de {totalPaginas}
            </small>
            <div className="btn-group btn-group-sm">
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((p) => p - 1)}
              >
                Anterior
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual((p) => p + 1)}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}