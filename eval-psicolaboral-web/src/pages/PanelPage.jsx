import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

// Layout & Dashboard
import Navbar from '../components/layout/Navbar';
import DashboardResumen from '../components/dashboard/DashboardResumen';

// Módulo Solicitudes
import FormularioSolicitud from '../components/solicitudes/FormularioSolicitud';
import TablaSolicitudes from '../components/solicitudes/TablaSolicitudes';

// Módulo Usuarios
import FormularioUsuario from '../components/usuarios/FormularioUsuario';
import TablaUsuarios from '../components/usuarios/TablaUsuarios';

// Modales
import ModalVerDetalle from '../components/modals/ModalVerDetalle';
import ModalEditarCandidato from '../components/modals/ModalEditarCandidato';
import ModalEvaluacion from '../components/modals/ModalEvaluacion';
import ModalConfirmarEliminar from '../components/modals/ModalConfirmarEliminar';
import ModalEditarUsuario from '../components/modals/ModalEditarUsuario';

export default function PanelPage({
  usuarioActual,
  onLogout,
  solicitudes,
  onCrearSolicitud,
  onEditarSolicitud,
  onEliminarSolicitud,
  onGuardarEvaluacion,
  cuentas,
  onCrearUsuario,
  onEditarUsuario,
  onEliminarUsuario
}) {
  if (!usuarioActual) {
    return <Navigate to="/login" replace />;
  }

  const [tabActiva, setTabActiva] = useState('solicitudes');
  const [mostrarFormSolicitud, setMostrarFormSolicitud] = useState(false);
  const [mostrarFormUsuario, setMostrarFormUsuario] = useState(false);

  // Modales
  const [modalDetalle, setModalDetalle] = useState(null);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalEvaluar, setModalEvaluar] = useState(null);
  const [modalEliminar, setModalEliminar] = useState(null);
  const [modalEditarUser, setModalEditarUser] = useState(null);

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <Navbar usuarioActual={usuarioActual} onLogout={onLogout} />

      <main className="container my-4 flex-grow-1">
        {/* Cabecera del Panel */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
          <div>
            <h4 className="fw-bold text-dark mb-0">Panel de Gestión Psicolaboral</h4>
            <span className="text-muted small">
              Sesión iniciada como <strong>{usuarioActual.nombre || usuarioActual.correo}</strong> ({usuarioActual.rol})
            </span>
          </div>

          {usuarioActual.rol === 'ADMIN' && (
            <div className="btn-group btn-group-sm shadow-sm">
              <button
                type="button"
                className={`btn ${tabActiva === 'solicitudes' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setTabActiva('solicitudes')}
              >
                Evaluaciones Psicolaborales
              </button>
              <button
                type="button"
                className={`btn ${tabActiva === 'usuarios' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setTabActiva('usuarios')}
              >
                Gestión de Usuarios ({cuentas.length})
              </button>
            </div>
          )}
        </div>

        {/* PESTAÑA 1: SOLICITUDES Y EVALUACIONES */}
        {tabActiva === 'solicitudes' && (
          <>
            <DashboardResumen solicitudes={solicitudes} />

            {/* BOTÓN HABILITADO PARA TODOS: ADMIN, EVALUADOR Y ANALISTA */}
            <div className="mb-3 text-end">
              <button
                type="button"
                className="btn btn-primary btn-sm px-3 shadow-sm"
                onClick={() => setMostrarFormSolicitud(!mostrarFormSolicitud)}
              >
                {mostrarFormSolicitud ? 'Cerrar Formulario' : '+ Registrar Nueva Solicitud'}
              </button>
            </div>

            {mostrarFormSolicitud && (
              <FormularioSolicitud
                usuarioActual={usuarioActual}
                onCrearSolicitud={(nueva) => {
                  onCrearSolicitud(nueva);
                  setMostrarFormSolicitud(false);
                }}
              />
            )}

            <TablaSolicitudes
              solicitudes={solicitudes}
              usuarioActual={usuarioActual}
              onVerDetalle={(item) => setModalDetalle(item)}
              onEditar={(item) => setModalEditar(item)}
              onEvaluar={(item) => setModalEvaluar(item)}
              onEliminar={(item) => setModalEliminar(item)}
            />
          </>
        )}

        {/* PESTAÑA 2: GESTIÓN DE USUARIOS */}
        {tabActiva === 'usuarios' && usuarioActual.rol === 'ADMIN' && (
          <>
            <div className="mb-3 text-end">
              <button
                type="button"
                className="btn btn-primary btn-sm px-3 shadow-sm"
                onClick={() => setMostrarFormUsuario(!mostrarFormUsuario)}
              >
                {mostrarFormUsuario ? 'Cerrar Formulario' : '+ Registrar Nuevo Usuario'}
              </button>
            </div>

            {mostrarFormUsuario && (
              <FormularioUsuario
                onCrearUsuario={(nuevo) => {
                  onCrearUsuario(nuevo);
                  setMostrarFormUsuario(false);
                }}
              />
            )}

            <TablaUsuarios
              usuarios={cuentas}
              usuarioActual={usuarioActual}
              onEditarUsuario={(user) => setModalEditarUser(user)}
              onEliminarUsuario={onEliminarUsuario}
            />
          </>
        )}
      </main>

      {/* MODALES CON CONTROL DE CIERRE DIRECTO */}
      {modalDetalle && (
        <ModalVerDetalle
          solicitud={modalDetalle}
          onClose={() => setModalDetalle(null)}
        />
      )}

      {modalEditar && (
        <ModalEditarCandidato
          solicitud={modalEditar}
          onClose={() => setModalEditar(null)}
          onGuardarEdicion={(editada) => {
            onEditarSolicitud(editada);
            setModalEditar(null);
          }}
        />
      )}

      {modalEvaluar && (
        <ModalEvaluacion
          solicitud={modalEvaluar}
          onClose={() => setModalEvaluar(null)}
          onGuardarEvaluacion={(evaluada) => {
            onGuardarEvaluacion(evaluada);
            setModalEvaluar(null);
          }}
        />
      )}

      {modalEliminar && (
        <ModalConfirmarEliminar
          solicitud={modalEliminar}
          onClose={() => setModalEliminar(null)}
          onConfirmar={() => {
            onEliminarSolicitud(modalEliminar.id);
            setModalEliminar(null);
          }}
        />
      )}

      {modalEditarUser && (
        <ModalEditarUsuario
          usuario={modalEditarUser}
          onClose={() => setModalEditarUser(null)}
          onGuardarEdicion={(userEditado) => {
            onEditarUsuario(userEditado);
            setModalEditarUser(null);
          }}
        />
      )}
    </div>
  );
}