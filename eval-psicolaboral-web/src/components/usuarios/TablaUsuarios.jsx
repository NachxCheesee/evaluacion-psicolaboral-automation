import React, { useState } from 'react';

export default function TablaUsuarios({
  usuarios = [],
  usuarioActual,
  onEditarUsuario,
  onEliminarUsuario
}) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('Todos');

  // Filtrado seguro sobre el arreglo de usuarios
  const usuariosFiltrados = (usuarios || []).filter((user) => {
    const texto = busqueda.toLowerCase().trim();
    const coincideTexto =
      (user.nombre && user.nombre.toLowerCase().includes(texto)) ||
      (user.correo && user.correo.toLowerCase().includes(texto));

    const coincideRol = filtroRol === 'Todos' || user.rol === filtroRol;

    return coincideTexto && coincideRol;
  });

  const getBadgeRol = (rol) => {
    switch (rol) {
      case 'ADMIN':
        return 'bg-danger';
      case 'EVALUADOR':
        return 'bg-success';
      case 'ANALISTA':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="card shadow-sm border-0 bg-white rounded-3">
      <div className="card-header bg-white border-bottom py-3">
        <h6 className="fw-bold mb-0 text-dark">Cuentas Institucionales Registradas</h6>
      </div>
      <div className="card-body p-3">
        {/* Filtros */}
        <div className="row g-2 mb-3">
          <div className="col-12 col-md-7">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Buscar por nombre o correo institucional..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-5">
            <select
              className="form-select form-select-sm"
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
            >
              <option value="Todos">Todos los Roles</option>
              <option value="ADMIN">Administrador (ADMIN)</option>
              <option value="ANALISTA">Analista de Selección</option>
              <option value="EVALUADOR">Evaluador Psicolaboral</option>
            </select>
          </div>
        </div>

        {/* Tabla de Usuarios */}
        <div className="table-responsive">
          <table className="table table-hover align-middle table-sm mb-0">
            <thead className="table-light">
              <tr>
                <th>Nombre / Funcionario</th>
                <th>Correo Electrónico</th>
                <th>Rol</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted small">
                    No se encontraron usuarios registrados.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => {
                  const esUsuarioEnSesion = usuarioActual?.id === u.id;
                  return (
                    <tr key={u.id}>
                      <td className="fw-semibold small">
                        {u.nombre}
                        {esUsuarioEnSesion && (
                          <span className="badge bg-light text-primary border ms-2 small">Sesión Activa</span>
                        )}
                      </td>
                      <td className="text-muted small">{u.correo}</td>
                      <td>
                        <span className={`badge ${getBadgeRol(u.rol)}`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => onEditarUsuario(u)}
                            title="Editar Datos"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            disabled={esUsuarioEnSesion}
                            onClick={() => {
                              if (window.confirm(`¿Estás seguro de eliminar la cuenta de ${u.nombre}?`)) {
                                onEliminarUsuario(u.id);
                              }
                            }}
                            title={esUsuarioEnSesion ? 'No puedes eliminar tu propia cuenta en sesión' : 'Eliminar Cuenta'}
                          >
                            Borrar
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
      </div>
    </div>
  );
}