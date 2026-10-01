import { useState, useEffect } from "react";
import LoginSimulado from "./components/LoginSimulado";
import Navbar from "./components/Navbar";
import DashboardResumen from "./components/DashboardResumen";
import FormularioSolicitud from "./components/FormularioSolicitud";
import TablaSolicitudes from "./components/TablaSolicitudes";

// Módulos de administración (Admin)
import FormularioUsuario from "./components/FormularioUsuario";
import TablaUsuarios from "./components/TablaUsuarios";
import ModalEditarUsuario from "./components/modals/ModalEditarUsuario";

// Modales de candidatos
import ModalVerDetalle from "./components/modals/ModalVerDetalle";
import ModalEditarCandidato from "./components/modals/ModalEditarCandidato";
import ModalEvaluacion from "./components/modals/ModalEvaluacion";

// Modal único y reutilizable para eliminar
import ModalConfirmarEliminar from "./components/modals/ModalConfirmarEliminar";

import { SOLICITUDES_INICIALES, CUENTAS_AUTORIZADAS } from "./data/mockData";

export default function App() {
  // 1. Inicialización reactiva con lectura de localStorage
  const [cuentas, setCuentas] = useState(() => {
    const cuentasGuardadas = localStorage.getItem("aquachile_cuentas");
    return cuentasGuardadas ? JSON.parse(cuentasGuardadas) : CUENTAS_AUTORIZADAS;
  });

  const [solicitudes, setSolicitudes] = useState(() => {
    const solicitudesGuardadas = localStorage.getItem("aquachile_solicitudes");
    return solicitudesGuardadas ? JSON.parse(solicitudesGuardadas) : SOLICITUDES_INICIALES;
  });

  const [usuarioActual, setUsuarioActual] = useState(null);

  // 2. Persistencia automática al alterar cualquiera de los arrays
  useEffect(() => {
    localStorage.setItem("aquachile_cuentas", JSON.stringify(cuentas));
  }, [cuentas]);

  useEffect(() => {
    localStorage.setItem("aquachile_solicitudes", JSON.stringify(solicitudes));
  }, [solicitudes]);

  // Estados desplegables de formularios
  const [mostrarFormularioCandidato, setMostrarFormularioCandidato] = useState(false);
  const [mostrarFormularioUsuario, setMostrarFormularioUsuario] = useState(false);
  
  // Modales candidatos
  const [solicitudDetalle, setSolicitudDetalle] = useState(null);
  const [solicitudAEditar, setSolicitudAEditar] = useState(null);
  const [solicitudAEvaluar, setSolicitudAEvaluar] = useState(null);
  const [solicitudAEliminar, setSolicitudAEliminar] = useState(null);

  // Modales usuarios
  const [usuarioAEditar, setUsuarioAEditar] = useState(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);

  // CRUD Candidatos
  const handleAgregarSolicitud = (nueva) => {
    setSolicitudes([nueva, ...solicitudes]);
    setMostrarFormularioCandidato(false);
  };

  const handleGuardarEdicionCandidato = (solicitudActualizada) => {
    setSolicitudes(
      solicitudes.map((s) => (s.id === solicitudActualizada.id ? solicitudActualizada : s))
    );
    setSolicitudAEditar(null);
  };

  const handleGuardarEvaluacion = (id, datosEvaluacion) => {
    setSolicitudes(
      solicitudes.map((s) =>
        s.id === id
          ? {
              ...s,
              estado: datosEvaluacion.estado,
              evaluacion: datosEvaluacion.evaluacion
            }
          : s
      )
    );
    setSolicitudAEvaluar(null);
  };

  const handleConfirmarEliminacionCandidato = () => {
    if (solicitudAEliminar) {
      setSolicitudes(solicitudes.filter((s) => s.id !== solicitudAEliminar.id));
      setSolicitudAEliminar(null);
    }
  };

  // CRUD Usuarios (Admin)
  const handleAgregarUsuario = (nuevo) => {
    setCuentas([...cuentas, nuevo]);
    setMostrarFormularioUsuario(false);
  };

  const handleGuardarEdicionUsuario = (usuarioActualizado) => {
    setCuentas(
      cuentas.map((c) => (c.id === usuarioActualizado.id ? usuarioActualizado : c))
    );
    setUsuarioAEditar(null);
  };

  const handleConfirmarEliminacionUsuario = () => {
    if (usuarioAEliminar) {
      setCuentas(cuentas.filter((c) => c.id !== usuarioAEliminar.id));
      setUsuarioAEliminar(null);
    }
  };

  if (!usuarioActual) {
    return <LoginSimulado cuentas={cuentas} onLogin={setUsuarioActual} />;
  }

  return (
    <div className="min-vh-100 d-flex flex-column pb-5">
      <Navbar
        usuarioActual={usuarioActual}
        onCerrarSesion={() => setUsuarioActual(null)}
      />

      <main className="container">
        <DashboardResumen solicitudes={solicitudes} />

        {/* SECCIÓN 1: EVALUACIONES / CANDIDATOS */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button
            className="btn btn-aqua-cta"
            onClick={() => setMostrarFormularioCandidato(!mostrarFormularioCandidato)}
          >
            {mostrarFormularioCandidato ? "✕ Cerrar Formulario" : "+ Nueva Solicitud de Evaluación"}
          </button>
        </div>

        {mostrarFormularioCandidato && (
          <FormularioSolicitud 
            onAgregarSolicitud={handleAgregarSolicitud}
            usuarioActual={usuarioActual}
          />
        )}

        <TablaSolicitudes
          solicitudes={solicitudes}
          rolActual={usuarioActual.rol}
          onAbrirDetalle={(sol) => setSolicitudDetalle(sol)}
          onAbrirEdicion={(sol) => setSolicitudAEditar(sol)}
          onAbrirEvaluacion={(sol) => setSolicitudAEvaluar(sol)}
          onSolicitarEliminar={(sol) => setSolicitudAEliminar(sol)}
        />

        {/* SECCIÓN 2: GESTIÓN DE USUARIOS (SOLO ADMIN) */}
        {usuarioActual.rol === "ADMIN" && (
          <>
            <div className="d-flex justify-content-between align-items-center mt-5 mb-3">
              <button
                className="btn btn-aqua-solid"
                onClick={() => setMostrarFormularioUsuario(!mostrarFormularioUsuario)}
              >
                {mostrarFormularioUsuario ? "✕ Cerrar Formulario Usuario" : "+ Nuevo Usuario Institucional"}
              </button>
            </div>

            {mostrarFormularioUsuario && (
              <FormularioUsuario
                cuentas={cuentas}
                onAgregarUsuario={handleAgregarUsuario}
              />
            )}

            <TablaUsuarios
              cuentas={cuentas}
              usuarioActual={usuarioActual}
              onAbrirEdicion={(usr) => setUsuarioAEditar(usr)}
              onSolicitarEliminar={(usr) => setUsuarioAEliminar(usr)}
            />
          </>
        )}

        {/* MODALES CANDIDATOS */}
        {solicitudDetalle && (
          <ModalVerDetalle
            solicitud={solicitudDetalle}
            onCerrar={() => setSolicitudDetalle(null)}
          />
        )}

        {solicitudAEditar && (
          <ModalEditarCandidato
            solicitud={solicitudAEditar}
            onGuardar={handleGuardarEdicionCandidato}
            onCerrar={() => setSolicitudAEditar(null)}
          />
        )}

        {solicitudAEvaluar && (
          <ModalEvaluacion
            solicitud={solicitudAEvaluar}
            onGuardarEvaluacion={handleGuardarEvaluacion}
            onCerrar={() => setSolicitudAEvaluar(null)}
          />
        )}

        {solicitudAEliminar && (
          <ModalConfirmarEliminar
            titulo="¿Eliminar postulación?"
            mensaje={
              <span>
                Estás a punto de eliminar el registro de <strong>{solicitudAEliminar.candidato}</strong> (RUT: <strong>{solicitudAEliminar.rut || "Sin RUT"}</strong>) para el cargo de <strong>{solicitudAEliminar.cargo}</strong>.
              </span>
            }
            textoBotonConfirmar="Sí, eliminar registro"
            onConfirmar={handleConfirmarEliminacionCandidato}
            onCancelar={() => setSolicitudAEliminar(null)}
          />
        )}

        {/* MODALES USUARIOS (ADMIN) */}
        {usuarioAEditar && (
          <ModalEditarUsuario
            usuario={usuarioAEditar}
            onGuardar={handleGuardarEdicionUsuario}
            onCerrar={() => setUsuarioAEditar(null)}
          />
        )}

        {usuarioAEliminar && (
          <ModalConfirmarEliminar
            titulo="¿Revocar acceso institucional?"
            mensaje={
              <span>
                Estás a punto de revocar el acceso a <strong>{usuarioAEliminar.nombre}</strong> (<code>{usuarioAEliminar.correo}</code>). Esta persona ya no podrá ingresar al sistema.
              </span>
            }
            textoBotonConfirmar="Sí, revocar acceso"
            onConfirmar={handleConfirmarEliminacionUsuario}
            onCancelar={() => setUsuarioAEliminar(null)}
          />
        )}
      </main>
    </div>
  );
}