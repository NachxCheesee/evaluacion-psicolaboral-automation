import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ usuarioActual, onLogout }) {
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm px-3 py-2">
      <div className="container-fluid">
        <Link to="/panel" className="navbar-brand d-flex align-items-center gap-2 fw-bold text-decoration-none">
          <i className="bi bi-water text-primary fs-4"></i>
          <span className="text-primary">AquaChile</span>
          <span className="badge bg-secondary text-uppercase fw-normal small">Psicolaboral</span>
        </Link>

        <div className="d-flex align-items-center gap-3 ms-auto">
          <Link to="/" className="btn btn-outline-light btn-sm">
            Ver Sitio Público
          </Link>

          {usuarioActual && (
            <div className="d-flex align-items-center gap-2">
              {/* Texto en blanco visible con nombre o correo */}
              <span className="d-none d-md-inline text-white small fw-medium">
                {usuarioActual.nombre || usuarioActual.correo}
              </span>
              <span className="badge bg-primary">{usuarioActual.rol}</span>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger ms-2"
                onClick={handleCerrarSesion}
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}