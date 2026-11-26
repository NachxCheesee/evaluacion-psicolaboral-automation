import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import PostularPage from './pages/PostularPage';
import LoginPage from './pages/LoginPage';
import PanelPage from './pages/PanelPage';

import * as auth from './lib/api';
import * as solicitudesApi from './services/solicitudes';
import * as cuentasApi from './services/cuentas';

export default function App() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [usuarioActual, setUsuarioActual] = useState(() => auth.obtenerUsuario());

  async function cargarDatosSegunRol(usuario) {
    const sols = await solicitudesApi.listarSolicitudes();
    setSolicitudes(sols);
    if (usuario && usuario.rol === 'ADMIN') {
      const cuens = await cuentasApi.listarCuentas();
      setCuentas(cuens);
    }
  }

  useEffect(() => {
    const u = auth.obtenerUsuario();
    if (!u) return;
    cargarDatosSegunRol(u).catch((e) => {
      console.error(e);
      auth.limpiarSesion();
      setUsuarioActual(null);
    });
  }, []);

  const handleLogin = (usuario) => {
    setUsuarioActual(usuario);
    cargarDatosSegunRol(usuario).catch((e) => console.error(e));
  };

  const handleLogout = async () => {
    await auth.logout();
    setUsuarioActual(null);
    setSolicitudes([]);
    setCuentas([]);
  };

  // Solicitudes
  const handleCrearSolicitud = async (nueva) => {
    try {
      const creada = await solicitudesApi.crearSolicitud(nueva);
      setSolicitudes((prev) => [creada, ...prev]);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleEditarSolicitud = async (editada) => {
    try {
      const actualizada = await solicitudesApi.actualizarSolicitud(editada);
      setSolicitudes((prev) => prev.map((s) => (s.id === editada.id ? actualizada : s)));
    } catch (e) {
      alert(e.message);
    }
  };

  const handleEliminarSolicitud = async (id) => {
    try {
      await solicitudesApi.eliminarSolicitud(id);
      setSolicitudes((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  const handleGuardarEvaluacion = async (evaluada) => {
    try {
      const actualizada = await solicitudesApi.actualizarEvaluacion(evaluada.id, evaluada);
      setSolicitudes((prev) => prev.map((s) => (s.id === evaluada.id ? actualizada : s)));
    } catch (e) {
      alert(e.message);
    }
  };

  // Usuarios
  const handleCrearUsuario = async (nuevo) => {
    try {
      const creada = await cuentasApi.crearCuenta(nuevo);
      setCuentas((prev) => [...prev, creada]);
    } catch (e) {
      alert(e.message);
    }
  };

  const handleEditarUsuario = async (editado) => {
    try {
      const actualizada = await cuentasApi.actualizarCuenta(editado);
      setCuentas((prev) => prev.map((u) => (u.id === editado.id ? actualizada : u)));
      if (usuarioActual && usuarioActual.id === editado.id) {
        setUsuarioActual((prev) => ({ ...prev, ...actualizada }));
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleEliminarUsuario = async (id) => {
    try {
      await cuentasApi.eliminarCuenta(id);
      setCuentas((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />

      <Route
        path="/postular"
        element={<PostularPage onCrearSolicitud={handleCrearSolicitud} />}
      />

      <Route
        path="/login"
        element={<LoginPage onLogin={handleLogin} />}
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
          />
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
