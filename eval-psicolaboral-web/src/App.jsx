import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { SOLICITUDES_INICIALES, CUENTAS_AUTORIZADAS } from './data/mockData';
import { supabaseConfigurado } from './lib/supabaseClient';
import { CATALOGOS_DEMO, listarCatalogos } from './services/catalogos';
import {
  listarSolicitudes,
  crearSolicitud,
  actualizarSolicitud,
  guardarEvaluacion,
  eliminarSolicitud
} from './services/solicitudes';
import {
  listarCuentas,
  loginUsuario,
  crearCuenta,
  actualizarCuenta,
  eliminarCuenta
} from './services/cuentas';

import HomePage from './pages/HomePage';
import PostularPage from './pages/PostularPage';
import LoginPage from './pages/LoginPage';
import PanelPage from './pages/PanelPage';

function leerSesionGuardada() {
  try {
    const guardada = localStorage.getItem('aquachile_session');
    return guardada ? JSON.parse(guardada) : null;
  } catch {
    localStorage.removeItem('aquachile_session');
    return null;
  }
}

export default function App() {
  const [solicitudes, setSolicitudes] = useState(
    supabaseConfigurado ? [] : SOLICITUDES_INICIALES
  );
  const [cuentas, setCuentas] = useState(
    supabaseConfigurado ? [] : CUENTAS_AUTORIZADAS
  );
  const [catalogos, setCatalogos] = useState(CATALOGOS_DEMO);
  const [usuarioActual, setUsuarioActual] = useState(leerSesionGuardada);
  const [modoDemo, setModoDemo] = useState(!supabaseConfigurado);
  const [cargando, setCargando] = useState(supabaseConfigurado);
  const [errorConexion, setErrorConexion] = useState('');
  const mostrarAccesosDemo =
    modoDemo ||
    import.meta.env.DEV ||
    import.meta.env.VITE_MOSTRAR_ACCESOS_DEMO === 'true';

  useEffect(() => {
    if (!supabaseConfigurado) return undefined;

    let activo = true;

    async function cargarDatos() {
      try {
        const [solicitudesDb, cuentasDb, catalogosDb] = await Promise.all([
          listarSolicitudes(),
          listarCuentas(),
          listarCatalogos()
        ]);

        if (!activo) return;

        setSolicitudes(solicitudesDb);
        setCuentas(cuentasDb);
        setCatalogos(catalogosDb);
        setModoDemo(false);
        setErrorConexion('');
      } catch (error) {
        if (!activo) return;

        setSolicitudes(SOLICITUDES_INICIALES);
        setCuentas(CUENTAS_AUTORIZADAS);
        setCatalogos(CATALOGOS_DEMO);
        setModoDemo(true);
        setErrorConexion(
          `No se pudo cargar Supabase. Se muestran datos demo. ${error.message}`
        );
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarDatos();
    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (usuarioActual) {
      localStorage.setItem('aquachile_session', JSON.stringify(usuarioActual));
    } else {
      localStorage.removeItem('aquachile_session');
    }
  }, [usuarioActual]);

  const refrescarSolicitudes = async () => {
    setSolicitudes(await listarSolicitudes());
  };

  const refrescarCuentas = async () => {
    setCuentas(await listarCuentas());
  };

  const handleLogin = async (correo, password) => {
    if (modoDemo) {
      const encontrado = cuentas.find(
        (cuenta) =>
          cuenta.correo.toLowerCase() === correo.trim().toLowerCase() &&
          cuenta.password === password
      );

      if (!encontrado) {
        throw new Error('Credenciales incorrectas. Verifique su correo corporativo y contraseña.');
      }

      setUsuarioActual(encontrado);
      return encontrado;
    }

    const encontrado = await loginUsuario(correo, password);

    if (!encontrado) {
      throw new Error('Credenciales incorrectas. Verifique su correo corporativo y contraseña.');
    }

    setUsuarioActual(encontrado);
    return encontrado;
  };

  const handleLogout = () => {
    setUsuarioActual(null);
  };

  const handleCrearSolicitud = async (nueva) => {
    if (modoDemo) {
      const creada = {
        ...nueva,
        id: Date.now(),
        codigo: nueva.codigo || `SOL-DEMO-${Date.now()}`,
        fecha: nueva.fecha || new Date().toISOString().split('T')[0]
      };
      setSolicitudes((prev) => [creada, ...prev]);
      return creada;
    }

    const resultado = await crearSolicitud(nueva, usuarioActual?.id ?? null);
    await refrescarSolicitudes();
    return resultado;
  };

  const handleEditarSolicitud = async (solicitudEditada) => {
    if (modoDemo) {
      setSolicitudes((prev) =>
        prev.map((solicitud) =>
          solicitud.id === solicitudEditada.id
            ? { ...solicitud, ...solicitudEditada }
            : solicitud
        )
      );
      return solicitudEditada;
    }

    await actualizarSolicitud(solicitudEditada, usuarioActual?.id ?? null);
    await refrescarSolicitudes();
    return solicitudEditada;
  };

  const handleEliminarSolicitud = async (id) => {
    if (modoDemo) {
      setSolicitudes((prev) => prev.filter((solicitud) => solicitud.id !== id));
      return;
    }

    await eliminarSolicitud(id, usuarioActual.id);
    await refrescarSolicitudes();
  };

  const handleGuardarEvaluacion = async (solicitudEvaluada) => {
    if (modoDemo) {
      setSolicitudes((prev) =>
        prev.map((solicitud) =>
          solicitud.id === solicitudEvaluada.id
            ? { ...solicitud, ...solicitudEvaluada }
            : solicitud
        )
      );
      return solicitudEvaluada;
    }

    await guardarEvaluacion(solicitudEvaluada, usuarioActual.id);
    await refrescarSolicitudes();
    return solicitudEvaluada;
  };

  const handleCrearUsuario = async (nuevo) => {
    if (modoDemo) {
      const creado = { ...nuevo, id: Date.now() };
      setCuentas((prev) => [...prev, creado]);
      return creado;
    }

    await crearCuenta(nuevo, usuarioActual.id);
    await refrescarCuentas();
  };

  const handleEditarUsuario = async (usuarioEditado) => {
    const datosBase = {
      id: usuarioEditado.id,
      nombre: usuarioEditado.nombre,
      correo: usuarioEditado.correo,
      rol: usuarioEditado.rol
    };

    if (modoDemo) {
      const actualizado = {
        ...usuarioEditado,
        password: usuarioEditado.nuevaPassword || usuarioEditado.password
      };
      delete actualizado.nuevaPassword;

      setCuentas((prev) =>
        prev.map((cuenta) =>
          cuenta.id === actualizado.id ? { ...cuenta, ...actualizado } : cuenta
        )
      );

      if (usuarioActual?.id === actualizado.id) {
        setUsuarioActual((prev) => ({ ...prev, ...actualizado }));
      }

      return actualizado;
    }

    await actualizarCuenta(usuarioEditado, usuarioActual.id);
    await refrescarCuentas();

    if (usuarioActual?.id === datosBase.id) {
      setUsuarioActual((prev) => ({ ...prev, ...datosBase }));
    }

    return datosBase;
  };

  const handleEliminarUsuario = async (id) => {
    if (modoDemo) {
      setCuentas((prev) => prev.filter((cuenta) => cuenta.id !== id));
      return;
    }

    await eliminarCuenta(id, usuarioActual.id);
    await refrescarCuentas();
  };

  if (cargando) {
    return (
      <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light gap-3">
        <div className="spinner-border text-primary" role="status"></div>
        <span className="text-muted small">Cargando datos desde Supabase...</span>
      </div>
    );
  }

  return (
    <>
      {errorConexion && (
        <div className="alert alert-warning rounded-0 mb-0 py-2 small text-center" role="alert">
          {errorConexion}
        </div>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />

        <Route
          path="/postular"
          element={
            <PostularPage
              onCrearSolicitud={handleCrearSolicitud}
              cargos={catalogos.cargosNombres}
            />
          }
        />

        <Route
          path="/login"
          element={
            <LoginPage
              onLogin={handleLogin}
              mostrarAccesosDemo={mostrarAccesosDemo}
            />
          }
        />

        <Route
          path="/panel"
          element={
            <PanelPage
              usuarioActual={usuarioActual}
              onLogout={handleLogout}
              solicitudes={solicitudes}
              onCrearSolicitud={handleCrearSolicitud}
              onEditarSolicitud={handleEditarSolicitud}
              onEliminarSolicitud={handleEliminarSolicitud}
              onGuardarEvaluacion={handleGuardarEvaluacion}
              cuentas={cuentas}
              onCrearUsuario={handleCrearUsuario}
              onEditarUsuario={handleEditarUsuario}
              onEliminarUsuario={handleEliminarUsuario}
              cargos={catalogos.cargosNombres}
              resultados={catalogos.resultados}
              modoDemo={modoDemo}
            />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
