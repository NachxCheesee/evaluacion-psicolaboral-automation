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

import { listarSolicitudes, crearSolicitud, actualizarSolicitud, actualizarEvaluacion, eliminarSolicitud } from "./services/solicitudes";
import { listarCuentas, crearCuenta, actualizarCuenta, eliminarCuenta } from "./services/cuentas";

export default function App() {
  // Datos desde Supabase (antes: localStorage)
  const [cuentas, setCuentas] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [errorOperacion, setErrorOperacion] = useState("");

  const [usuarioActual, setUsuarioActual] = useState(null);

  // Carga inicial desde la BDD
  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const [cuentasCargadas, solicitudesCargadas] = await Promise.all([
          listarCuentas(),
          listarSolicitudes()
        ]);
        if (!activo) return;
        setCuentas(cuentasCargadas);
        setSolicitudes(solicitudesCargadas);
      } catch (e) {
        if (activo) setErrorCarga(e.message);
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

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
  const handleAgregarSolicitud = async (nueva) => {
    try {
      const creada = await crearSolicitud(nueva);
      setSolicitudes((prev) => [creada, ...prev]);
      setMostrarFormularioCandidato(false);
      setErrorOperacion("");
    } catch (e) {
      setErrorOperacion(`No se pudo crear la solicitud: ${e.message}`);
    }
  };

  const handleGuardarEdicionCandidato = async (solicitudActualizada) => {
    try {
      const guardada = await actualizarSolicitud(solicitudActualizada);
      setSolicitudes((prev) => prev.map((s) => (s.id === guardada.id ? guardada : s)));
      setSolicitudAEditar(null);
      setErrorOperacion("");
    } catch (e) {
      setErrorOperacion(`No se pudo editar la solicitud: ${e.message}`);
    }
  };

  const handleGuardarEvaluacion = async (id, datosEvaluacion) => {
    try {
      const actualizada = await actualizarEvaluacion(id, datosEvaluacion);
      setSolicitudes((prev) => prev.map((s) => (s.id === actualizada.id ? actualizada : s)));
      setSolicitudAEvaluar(null);
      setErrorOperacion("");
    } catch (e) {
      setErrorOperacion(`No se pudo guardar la evaluación: ${e.message}`);
    }
  };

  const handleConfirmarEliminacionCandidato = async () => {
    if (!solicitudAEliminar) return;
    try {
      await eliminarSolicitud(solicitudAEliminar.id);
      const idEliminada = solicitudAEliminar.id;
      setSolicitudes((prev) => prev.filter((s) => s.id !== idEliminada));
      setSolicitudAEliminar(null);
      setErrorOperacion("");
    } catch (e) {
      setErrorOperacion(`No se pudo eliminar la solicitud: ${e.message}`);
    }
  };

  // CRUD Usuarios (Admin)
  const handleAgregarUsuario = async (nuevo) => {
    try {
      const creada = await crearCuenta(nuevo);
      setCuentas((prev) => [...prev, creada]);
      setMostrarFormularioUsuario(false);
      setErrorOperacion("");
    } catch (e) {
      setErrorOperacion(`No se pudo crear el usuario: ${e.message}`);
    }
  };

  const handleGuardarEdicionUsuario = async (usuarioActualizado) => {
    try {
      const guardado = await actualizarCuenta(usuarioActualizado);
      setCuentas((prev) => prev.map((c) => (c.id === guardado.id ? guardado : c)));
      setUsuarioAEditar(null);
      setErrorOperacion("");
    } catch (e) {
      setErrorOperacion(`No se pudo editar el usuario: ${e.message}`);
    }
  };

  const handleConfirmarEliminacionUsuario = async () => {
    if (!usuarioAEliminar) return;
    try {
      await eliminarCuenta(usuarioAEliminar.id);
      const idEliminada = usuarioAEliminar.id;
      setCuentas((prev) => prev.filter((c) => c.id !== idEliminada));
      setUsuarioAEliminar(null);
      setErrorOperacion("");
    } catch (e) {
      setErrorOperacion(`No se pudo eliminar el usuario: ${e.message}`);
    }
  };

  if (cargando) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center">
        <div className="spinner-border text-secondary mb-3" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <small className="text-muted">Conectando con la base de datos...</small>
      </div>
    );
  }

  if (errorCarga) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100 py-4">
        <div className="card-aquachile p-4 p-md-5 w-100" style={{ maxWidth: "560px" }}>
          <h5 className="fw-semibold mb-3" style={{ color: "var(--aqua-text-dark)" }}>
            No se pudo conectar con la base de datos
          </h5>
          <div className="alert alert-danger py-2 small border-0">{errorCarga}</div>
          <p className="text-muted small mb-2">
            Verifica que exista el archivo <code>.env</code> con tus credenciales (usa{" "}
            <code>.env.example</code> como plantilla) y que en Supabase se hayan ejecutado{" "}
            <code>supabase/schema.sql</code> y <code>supabase/seed.sql</code>.
          </p>
          <button className="btn btn-aqua-cta" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

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
        {errorOperacion && (
          <div className="alert alert-danger py-2 small border-0 d-flex justify-content-between align-items-center">
            <span>{errorOperacion}</span>
            <button
              type="button"
              className="btn-close"
              aria-label="Cerrar"
              onClick={() => setErrorOperacion("")}
            ></button>
          </div>
        )}

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
