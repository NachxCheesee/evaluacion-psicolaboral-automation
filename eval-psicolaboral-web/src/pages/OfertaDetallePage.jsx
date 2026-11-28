import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerOfertaPublica } from '../services/ofertas';

const modalidadTexto = {
  PRESENCIAL: 'Presencial',
  HIBRIDA: 'Híbrida',
  REMOTA: 'Remota'
};

const fechaTexto = (valor) => {
  if (!valor) return 'Sin fecha';
  const fecha = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleDateString('es-CL');
};

export default function OfertaDetallePage() {
  const { id } = useParams();
  const [oferta, setOferta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const data = await obtenerOfertaPublica(id);
        if (activo) setOferta(data);
      } catch (err) {
        if (activo) setError(err.message || 'No fue posible cargar la oferta.');
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [id]);

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <header className="navbar navbar-expand-lg bg-white border-bottom shadow-sm px-4 py-3">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold text-decoration-none">
            <i className="bi bi-water text-primary fs-4"></i>
            <span className="text-primary fs-4">AquaChile</span>
            <span className="text-secondary small border-start ps-2 d-none d-sm-inline">
              Detalle de Oferta
            </span>
          </Link>
          <Link to="/ofertas" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left me-1"></i>
            Volver a ofertas
          </Link>
        </div>
      </header>

      <main className="container my-5 flex-grow-1" style={{ maxWidth: '920px' }}>
        {cargando && (
          <div className="text-center py-5 text-muted">
            <span className="spinner-border spinner-border-sm me-2"></span>
            Cargando oferta...
          </div>
        )}

        {error && <div className="alert alert-warning">{error}</div>}

        {oferta && (
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4 p-md-5">
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="badge bg-primary-subtle text-primary">{oferta.categoria}</span>
                <span className="badge bg-secondary">{modalidadTexto[oferta.modalidad] || oferta.modalidad}</span>
                <span className="badge bg-light text-dark border">{oferta.cupos} cupos</span>
              </div>

              <h1 className="fw-bold text-dark mb-2">{oferta.cargo}</h1>
              <p className="text-muted mb-3">
                <i className="bi bi-geo-alt me-1"></i>{oferta.ubicacion}
                <span className="mx-2">·</span>
                <i className="bi bi-calendar3 me-1"></i>Publicada el {fechaTexto(oferta.fechaPublicacion)}
              </p>

              <div className="row g-4">
                <div className="col-12">
                  <h6 className="fw-bold text-dark">Descripción</h6>
                  <p className="text-muted mb-0">{oferta.descripcion || 'Sin descripción registrada.'}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold text-dark">Funciones</h6>
                  <p className="text-muted mb-0">{oferta.funciones || 'Sin funciones detalladas.'}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold text-dark">Requisitos</h6>
                  <p className="text-muted mb-0">{oferta.requisitos || 'Sin requisitos detallados.'}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold text-dark">Beneficios</h6>
                  <p className="text-muted mb-0">{oferta.beneficios || 'Sin beneficios detallados.'}</p>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-bold text-dark">Rango salarial</h6>
                  <p className="text-muted mb-0">{oferta.sueldo || 'A convenir'}</p>
                </div>
                {oferta.responsableNombre && (
                  <div className="col-12">
                    <h6 className="fw-bold text-dark">Responsable</h6>
                    <p className="text-muted mb-0">{oferta.responsableNombre}</p>
                  </div>
                )}
              </div>

              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mt-4 pt-4 border-top">
                <Link to="/ofertas" className="text-decoration-none small text-muted">
                  Ver otras ofertas
                </Link>
                <Link to={`/postular/${oferta.id}`} className="btn btn-primary px-4">
                  <i className="bi bi-file-earmark-person me-1"></i>
                  Postular a esta oferta
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
