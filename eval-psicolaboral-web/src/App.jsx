import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Datos iniciales
import { SOLICITUDES_INICIALES, CUENTAS_AUTORIZADAS } from './data/mockData';

// Vistas del sistema (Pages)
import HomePage from './pages/HomePage';
import PostularPage from './pages/PostularPage';
import LoginPage from './pages/LoginPage';
import PanelPage from './pages/PanelPage';

export default function App() {
  // 1. Estado de Solicitudes con persistencia en localStorage
  const [solicitudes, setSolicitudes] = useState(() => {
    const guardadas = localStorage.getItem('aquachile_solicitudes');
    return guardadas ? JSON.parse(guardadas) : SOLICITUDES_INICIALES;
  });

  // 2. Estado de Cuentas Institucionales con persistencia
  const [cuentas, setCuentas] = useState(() => {
    const guardadas = localStorage.getItem('aquachile_cuentas');
    return guardadas ? JSON.parse(guardadas) : CUENTAS_AUTORIZADAS;
  });

  // 3. Estado de Sesión del Usuario con persistencia
  const [usuarioActual, setUsuarioActual] = useState(() => {
    const guardado = localStorage.getItem('aquachile_session');
    return guardado ? JSON.parse(guardado) : null;
  });

  // Sincronización continua con localStorage
  useEffect(() => {
    localStorage.setItem('aquachile_solicitudes', JSON.stringify(solicitudes));
  }, [solicitudes]);

  useEffect(() => {
    localStorage.setItem('aquachile_cuentas', JSON.stringify(cuentas));
  }, [cuentas]);

  useEffect(() => {
    if (usuarioActual) {
      localStorage.setItem('aquachile_session', JSON.stringify(usuarioActual));
    } else {
      localStorage.removeItem('aquachile_session');
    }
  }, [usuarioActual]);

  // Handlers de Sesión
  const handleLogin = (usuario) => {
    setUsuarioActual(usuario);
  };

  const handleLogout = () => {
    setUsuarioActual(null);
  };

  // Handlers de Solicitudes (CRUD)
  const handleCrearSolicitud = (nueva) => {
    setSolicitudes((prev) => [nueva, ...prev]);
  };

  const handleEditarSolicitud = (solicitudEditada) => {
    setSolicitudes((prev) =>
      prev.map((s) => (s.id === solicitudEditada.id ? { ...s, ...solicitudEditada } : s))
    );
  };

  const handleEliminarSolicitud = (id) => {
    setSolicitudes((prev) => prev.filter((s) => s.id !== id));
  };

  const handleGuardarEvaluacion = (solicitudEvaluada) => {
    setSolicitudes((prev) =>
      prev.map((s) => (s.id === solicitudEvaluada.id ? { ...s, ...solicitudEvaluada } : s))
    );
  };

  // Handlers de Cuentas de Usuario (Exclusivo Administrador)
  const handleCrearUsuario = (nuevo) => {
    setCuentas((prev) => [...prev, nuevo]);
  };

  const handleEditarUsuario = (usuarioEditado) => {
    setCuentas((prev) =>
      prev.map((u) => (u.id === usuarioEditado.id ? { ...u, ...usuarioEditado } : u))
    );
    // Si el usuario en sesión editó sus propios datos, actualizar sesión activa
    if (usuarioActual?.id === usuarioEditado.id) {
      setUsuarioActual((prev) => ({ ...prev, ...usuarioEditado }));
    }
  };

  const handleEliminarUsuario = (id) => {
    setCuentas((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <Routes>
      {/* 1. Portal Informativo Público */}
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />

      {/* 2. Formulario de Postulación Abierta (Externo) */}
      <Route
        path="/postular"
        element={<PostularPage onCrearSolicitud={handleCrearSolicitud} />}
      />

      {/* 3. Acceso Institucional */}
      <Route
        path="/login"
        element={<LoginPage cuentas={cuentas} onLogin={handleLogin} />}
      />

      {/* 4. Panel Interno de Gestión Psicolaboral (Protegido) */}
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

      {/* Redirección por defecto si ingresan una ruta inexistente */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}