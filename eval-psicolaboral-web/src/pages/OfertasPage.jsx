import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarOfertasPublicas } from '../services/ofertas';

const modalidadTexto = {
  PRESENCIAL: 'Presencial',
  HIBRIDA: 'Híbrida',
  REMOTA: 'Remota'
};

const fechaCorta = (valor) => {
  if (!valor) return 'Sin fecha';
  const fecha = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleDateString('es-CL');
};

export default function OfertasPage() {
  const [ofertas, setOfertas] = useState([]);
  const [categoria, setCategoria] = useState('Todas');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const data = await listarOfertasPublicas();
        if (activo) setOfertas(data || []);
      } catch (err) {
        if (activo) setError(err.message || 'No fue posible cargar las ofertas.');
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  const categorias = useMemo(() => {
    const valores = new Set(ofertas.map((oferta) => oferta.categoria).filter(Boolean));
    return ['Todas', ...Array.from(valores).sort()];
  }, [ofertas]);

  const filtradas = categoria === 'Todas'
    ? ofertas
    : ofertas.filter((oferta) => oferta.categoria === categoria);

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <header className="navbar navbar-expand-lg bg-white border-bottom shadow-sm px-4 py-3">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-bold text-decoration-none">
            <i className="bi bi-water text-primary fs-4"></i>
            <span className="text-primary fs-4">AquaChile</span>
            <span className="text-secondary small border-start ps-2 d-none d-sm-inline">
              Ofertas Laborales
            </span>
          </Link>
          <div className="d-flex gap-2">
            <Link to="/" className="btn btn-outline-secondary btn-sm">Inicio</Link>
            <Link to="/login" className="btn btn-primary btn-sm">Portal Colaboradores</Link>
          </div>
        </div>
      </header>

      <main className="container my-5 flex-grow-1">
        <div className="d-flex flex-column flex-md-row justify-content-between gap-3 align-items-md-end mb-4">
          <div>
            <span className="badge bg-primary-subtle text-primary text-uppercase fw-semibold mb-2">
              Convocatorias vigentes
            </span>
            <h1 className="fw-bold text-dark mb-1">Ofertas laborales</h1>
            <p className="text-muted mb-0">
              Encuentra una oportunidad en las operaciones de AquaChile en el sur austral.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <label className="small fw-semibold text-muted mb-0" htmlFor="filtroCategoria">
              Categoría
            </label>
            <select
              id="filtroCategoria"
              className="form-select form-select-sm"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              {categorias.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        {cargando ? (
          <div className="text-center py-5 text-muted">
            <span className="spinner-border spinner-border-sm me-2"></span>
            Cargando ofertas...
          </div>
        ) : filtradas.length === 0 ? (
          <div className="alert alert-info">No hay ofertas publicadas para esta categoría.</div>
        ) : (
          <div className="row g-4">
            {filtradas.map((oferta) => (
              <div className="col-md-6 col-xl-4" key={oferta.id}>
                <div className="card h-100 border-0 shadow-sm rounded-3 bg-white">
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                      <span className="badge bg-light text-primary border">{oferta.categoria}</span>
                      <span className="badge bg-secondary">{modalidadTexto[oferta.modalidad] || oferta.modalidad}</span>
                    </div>
                    <h5 className="fw-bold text-dark mb-1">{oferta.cargo}</h5>
                    <div className="text-muted small mb-2">
                      <i className="bi bi-geo-alt me-1"></i>
                      {oferta.ubicacion}
                    </div>
                    <p className="text-muted small flex-grow-1">
                      {oferta.descripcion || 'Revisa el detalle de la convocatoria.'}
                    </p>
                    <div className="d-flex justify-content-between small text-muted mb-3">
                      <span><i className="bi bi-people me-1"></i>{oferta.cupos} cupos</span>
                      <span><i className="bi bi-calendar3 me-1"></i>{fechaCorta(oferta.fechaPublicacion)}</span>
                    </div>
                    <Link to={`/ofertas/${oferta.id}`} className="btn btn-primary btn-sm w-100">
                      Ver detalle y postular
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
