import React, { useState } from 'react';

export default function TablaUsuarios({
  usuarios = [],
  usuarioActual,
  onEditarUsuario,
  onEliminarUsuario
}) {
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('Todos');
  
  // Estado para controlar qué usuario se está por eliminar con el Modal
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);

  // Filtrado seguro sobre el arreglo de usuarios
  const usuariosFiltrados = (usuarios || []).filter((user) => {
    const texto = busqueda.toLowerCase().trim();
    const coincideTexto =
      (user.nombre && user.nombre.toLowerCase().includes(texto)) ||
      (user.correo && user.correo.toLowerCase().includes(texto));

    const coincideRol = filtroRol === 'Todos' || user.rol === filtroRol;

    return coincideTexto && coincideRol;
  });

  // Clases estéticas corporativas (sin colores chillones)
  const getBadgeRol = (rol) => {
    switch (rol) {
      case 'ADMIN':
        return 'badge-rol-admin';
      case 'EVALUADOR':
        return 'badge-rol-evaluador';
      case 'ANALISTA':
        return 'badge-rol-analista';
      default:
        return 'badge bg-secondary';
    }
  };

  const confirmarEliminacion = () => {
    if (usuarioAEliminar) {
      onEliminarUsuario(usuarioAEliminar.id);
      setUsuarioAEliminar(null);
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
                          <span className="badge-sesion-activa ms-2">
                            Sesión Activa
                          </span>
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
                            onClick={() => setUsuarioAEliminar(u)}
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

      {/* MODAL DE CONFIRMACIÓN DE BORRADO DE USUARIO */}
      {usuarioAEliminar && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', zIndex: 1055 }}
          onClick={() => setUsuarioAEliminar(null)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-light py-3 border-bottom">
                <h5 className="modal-title fw-bold text-danger mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                  <span>Eliminar Cuenta Institucional</span>
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setUsuarioAEliminar(null)}
                  aria-label="Cerrar"
                ></button>
              </div>

              <div className="modal-body p-4">
                <p className="mb-2 text-dark">
                  ¿Estás seguro de que deseas revocar el acceso y eliminar permanentemente a este usuario?
                </p>
                <div className="p-3 bg-light rounded-3 border mb-3">
                  <div className="fw-bold text-dark">{usuarioAEliminar.nombre}</div>
                  <div className="text-muted small">
                    {usuarioAEliminar.correo} · Rol: <span className="fw-semibold text-dark">{usuarioAEliminar.rol}</span>
                  </div>
                </div>
                <p className="text-muted small mb-0">
                  <i className="bi bi-info-circle me-1"></i>
                  Esta acción revocará sus permisos en el sistema de inmediato.
                </p>
              </div>

              <div className="modal-footer bg-light py-2 border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm px-3"
                  onClick={() => setUsuarioAEliminar(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm px-3 fw-semibold d-flex align-items-center gap-1"
                  onClick={confirmarEliminacion}
                >
                  <i className="bi bi-trash3"></i>
                  <span>Eliminar Cuenta</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}