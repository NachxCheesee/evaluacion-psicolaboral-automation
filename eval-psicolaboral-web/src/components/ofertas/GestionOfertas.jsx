import { useEffect, useState } from 'react';
import {
  actualizarEstadoPostulacion,
  actualizarOferta,
  crearOferta,
  despublicarOferta,
  eliminarOferta,
  listarOfertasAdmin,
  listarPostulacionesOferta,
  publicarOferta
} from '../../services/ofertas';

const FORMULARIO_VACIO = {
  cargo: '',
  categoria: '',
  ubicacion: '',
  modalidad: 'PRESENCIAL',
  fechaPublicacion: new Date().toISOString().split('T')[0],
  cupos: 1,
  descripcion: '',
  funciones: '',
  requisitos: '',
  beneficios: '',
  sueldo: '',
  publicada: false,
  responsableId: ''
};

const fechaCorta = (valor) => {
  if (!valor) return '-';
  const fecha = new Date(`${valor}T00:00:00`);
  return Number.isNaN(fecha.getTime()) ? valor : fecha.toLocaleDateString('es-CL');
};

const claseEstado = (estado) => {
  switch (estado) {
    case 'EN_REVISION':
      return 'bg-info text-dark';
    case 'RECHAZADA':
      return 'bg-danger';
    case 'CONTRATADA':
      return 'bg-success';
    default:
      return 'bg-secondary';
  }
};

export default function GestionOfertas({ cuentas = [] }) {
  const [ofertas, setOfertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [formulario, setFormulario] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [ofertaPostulaciones, setOfertaPostulaciones] = useState(null);
  const [postulaciones, setPostulaciones] = useState([]);
  const [cargandoPostulaciones, setCargandoPostulaciones] = useState(false);

  const cargarOfertas = async () => {
    setCargando(true);
    setError('');
    try {
      setOfertas(await listarOfertasAdmin());
    } catch (err) {
      setError(err.message || 'No fue posible cargar las ofertas.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let activo = true;

    async function cargarInicial() {
      try {
        const data = await listarOfertasAdmin();
        if (activo) setOfertas(data || []);
      } catch (err) {
        if (activo) setError(err.message || 'No fue posible cargar las ofertas.');
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarInicial();
    return () => {
      activo = false;
    };
  }, []);

  const abrirNueva = () => {
    setFormulario({ ...FORMULARIO_VACIO });
    setMensaje('');
  };

  const abrirEdicion = (oferta) => {
    setFormulario({
      id: oferta.id,
      cargo: oferta.cargo || '',
      categoria: oferta.categoria || '',
      ubicacion: oferta.ubicacion || '',
      modalidad: oferta.modalidad || 'PRESENCIAL',
      fechaPublicacion: oferta.fechaPublicacion || new Date().toISOString().split('T')[0],
      cupos: oferta.cupos ?? 1,
      descripcion: oferta.descripcion || '',
      funciones: oferta.funciones || '',
      requisitos: oferta.requisitos || '',
      beneficios: oferta.beneficios || '',
      sueldo: oferta.sueldo || '',
      publicada: Boolean(oferta.publicada),
      responsableId: oferta.responsableId ?? ''
    });
    setMensaje('');
  };

  const cambiarCampo = (e) => {
    const { name, value, type, checked } = e.target;
    setFormulario((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setGuardando(true);

    const payload = {
      cargo: formulario.cargo,
      categoria: formulario.categoria,
      ubicacion: formulario.ubicacion,
      modalidad: formulario.modalidad,
      fechaPublicacion: formulario.fechaPublicacion || null,
      cupos: Number(formulario.cupos),
      descripcion: formulario.descripcion || null,
      funciones: formulario.funciones || null,
      requisitos: formulario.requisitos || null,
      beneficios: formulario.beneficios || null,
      sueldo: formulario.sueldo || null,
      publicada: Boolean(formulario.publicada),
      responsableId: formulario.responsableId === '' ? null : Number(formulario.responsableId)
    };

    try {
      if (formulario.id) {
        await actualizarOferta(formulario.id, payload);
        setMensaje('Oferta actualizada correctamente.');
      } else {
        await crearOferta(payload);
        setMensaje('Oferta creada correctamente.');
      }
      setFormulario(null);
      await cargarOfertas();
    } catch (err) {
      setError(err.message || 'No fue posible guardar la oferta.');
    } finally {
      setGuardando(false);
    }
  };

  const alternarPublicacion = async (oferta) => {
    setError('');
    setMensaje('');
    try {
      if (oferta.publicada) {
        await despublicarOferta(oferta.id);
        setMensaje('Oferta despublicada.');
      } else {
        await publicarOferta(oferta.id);
        setMensaje('Oferta publicada.');
      }
      await cargarOfertas();
    } catch (err) {
      setError(err.message || 'No fue posible cambiar la publicación.');
    }
  };

  const borrar = async (oferta) => {
    if (!window.confirm(`¿Eliminar la oferta "${oferta.cargo}"?`)) return;
    setError('');
    setMensaje('');
    try {
      await eliminarOferta(oferta.id);
      setMensaje('Oferta eliminada.');
      await cargarOfertas();
    } catch (err) {
      setError(err.message || 'No fue posible eliminar la oferta.');
    }
  };

  const verPostulaciones = async (oferta) => {
    setOfertaPostulaciones(oferta);
    setPostulaciones([]);
    setCargandoPostulaciones(true);
    setError('');
    try {
      setPostulaciones(await listarPostulacionesOferta(oferta.id));
    } catch (err) {
      setError(err.message || 'No fue posible cargar las postulaciones.');
    } finally {
      setCargandoPostulaciones(false);
    }
  };

  const cambiarEstadoPostulacion = async (postulacion, estado) => {
    try {
      await actualizarEstadoPostulacion(postulacion.id, estado);
      if (ofertaPostulaciones) {
        await verPostulaciones(ofertaPostulaciones);
      }
    } catch (err) {
      setError(err.message || 'No fue posible actualizar el estado.');
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      {error && <div className="alert alert-danger py-2 small mb-0">{error}</div>}
      {mensaje && <div className="alert alert-success py-2 small mb-0">{mensaje}</div>}

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div>
          <h5 className="fw-bold mb-1">Ofertas laborales</h5>
          <p className="text-muted small mb-0">Administra las convocatorias y su publicación en el portal público.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={abrirNueva}>
          + Nueva oferta
        </button>
      </div>

      {formulario && (
        <form className="card border-0 shadow-sm" onSubmit={guardar}>
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">{formulario.id ? 'Editar oferta' : 'Nueva oferta'}</h6>
              <button type="button" className="btn-close" onClick={() => setFormulario(null)}></button>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Cargo *</label>
                <input type="text" name="cargo" className="form-control form-control-sm" value={formulario.cargo} onChange={cambiarCampo} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Categoría / Familia *</label>
                <input type="text" name="categoria" className="form-control form-control-sm" value={formulario.categoria} onChange={cambiarCampo} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Ubicación *</label>
                <input type="text" name="ubicacion" className="form-control form-control-sm" value={formulario.ubicacion} onChange={cambiarCampo} required />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Modalidad *</label>
                <select name="modalidad" className="form-select form-select-sm" value={formulario.modalidad} onChange={cambiarCampo}>
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="HIBRIDA">Híbrida</option>
                  <option value="REMOTA">Remota</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Cupos *</label>
                <input type="number" min="0" name="cupos" className="form-control form-control-sm" value={formulario.cupos} onChange={cambiarCampo} required />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Fecha publicación</label>
                <input type="date" name="fechaPublicacion" className="form-control form-control-sm" value={formulario.fechaPublicacion} onChange={cambiarCampo} />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Sueldo o rango</label>
                <input type="text" name="sueldo" className="form-control form-control-sm" value={formulario.sueldo} onChange={cambiarCampo} placeholder="Ej: $850.000 - $1.100.000" />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Responsable</label>
                <select name="responsableId" className="form-select form-select-sm" value={formulario.responsableId} onChange={cambiarCampo}>
                  <option value="">Sin responsable</option>
                  {cuentas.map((cuenta) => (
                    <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre} ({cuenta.rol})</option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Descripción</label>
                <textarea rows="2" name="descripcion" className="form-control form-control-sm" value={formulario.descripcion} onChange={cambiarCampo}></textarea>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Funciones</label>
                <textarea rows="3" name="funciones" className="form-control form-control-sm" value={formulario.funciones} onChange={cambiarCampo}></textarea>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Requisitos</label>
                <textarea rows="3" name="requisitos" className="form-control form-control-sm" value={formulario.requisitos} onChange={cambiarCampo}></textarea>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">Beneficios</label>
                <textarea rows="3" name="beneficios" className="form-control form-control-sm" value={formulario.beneficios} onChange={cambiarCampo}></textarea>
              </div>
              <div className="col-12">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="ofertaPublicada" name="publicada" checked={formulario.publicada} onChange={cambiarCampo} />
                  <label className="form-check-label small" htmlFor="ofertaPublicada">Publicar inmediatamente en el portal</label>
                </div>
              </div>
            </div>

            <div className="text-end mt-3">
              <button type="button" className="btn btn-outline-secondary btn-sm me-2" onClick={() => setFormulario(null)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar oferta'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Cargo</th>
                <th>Categoría</th>
                <th>Ubicación</th>
                <th>Modalidad</th>
                <th>Cupos</th>
                <th>Publicación</th>
                <th>Estado</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr><td colSpan="8" className="text-center py-4 text-muted">Cargando ofertas...</td></tr>
              ) : ofertas.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-4 text-muted">No hay ofertas registradas.</td></tr>
              ) : (
                ofertas.map((oferta) => (
                  <tr key={oferta.id}>
                    <td className="fw-semibold text-dark">{oferta.cargo}</td>
                    <td className="small text-muted">{oferta.categoria}</td>
                    <td className="small text-muted">{oferta.ubicacion}</td>
                    <td><span className="badge bg-light text-dark border">{oferta.modalidad}</span></td>
                    <td>{oferta.cupos}</td>
                    <td className="small text-muted">{fechaCorta(oferta.fechaPublicacion)}</td>
                    <td>
                      <span className={`badge ${oferta.publicada ? 'bg-success' : 'bg-secondary'}`}>
                        {oferta.publicada ? 'Publicada' : 'Borrador'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => abrirEdicion(oferta)}>Editar</button>
                        <button type="button" className="btn btn-outline-primary" onClick={() => alternarPublicacion(oferta)}>
                          {oferta.publicada ? 'Despublicar' : 'Publicar'}
                        </button>
                        <button type="button" className="btn btn-outline-dark" onClick={() => verPostulaciones(oferta)}>Postulaciones</button>
                        <button type="button" className="btn btn-outline-danger" onClick={() => borrar(oferta)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {ofertaPostulaciones && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h6 className="modal-title fw-bold">Postulaciones · {ofertaPostulaciones.cargo}</h6>
                <button type="button" className="btn-close" onClick={() => setOfertaPostulaciones(null)}></button>
              </div>
              <div className="modal-body p-0">
                {cargandoPostulaciones ? (
                  <div className="text-center py-4 text-muted">Cargando postulaciones...</div>
                ) : postulaciones.length === 0 ? (
                  <div className="text-center py-4 text-muted">Esta oferta aún no tiene postulaciones.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Postulante</th>
                          <th>RUT</th>
                          <th>Solicitud</th>
                          <th>CV</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {postulaciones.map((postulacion) => (
                          <tr key={postulacion.id}>
                            <td className="small fw-semibold">{postulacion.postulanteNombre}</td>
                            <td className="small text-muted">{postulacion.postulanteRut}</td>
                            <td className="small text-muted">{postulacion.solicitudId || '-'}</td>
                            <td className="small text-muted">{postulacion.cvNombre || '-'}</td>
                            <td>
                              <select
                                className={`form-select form-select-sm ${claseEstado(postulacion.estado)}`}
                                value={postulacion.estado}
                                onChange={(e) => cambiarEstadoPostulacion(postulacion, e.target.value)}
                              >
                                <option value="RECIBIDA">RECIBIDA</option>
                                <option value="EN_REVISION">EN_REVISION</option>
                                <option value="RECHAZADA">RECHAZADA</option>
                                <option value="CONTRATADA">CONTRATADA</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
