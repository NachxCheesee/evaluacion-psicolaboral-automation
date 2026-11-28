import { useEffect, useState } from 'react';
import {
  CONFIGURACION_IA_DEMO,
  PERFILES_CARGO_DEMO,
  guardarConfiguracionIA,
  guardarPerfilCargoIA,
  listarCargosIA,
  obtenerConfiguracionIA
} from '../../services/ia';

const formatearFecha = (valor) => {
  if (!valor) return 'Sin Actualizar';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return 'Sin Actualizar';
  return fecha.toLocaleString('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
};

export default function ConfiguracionIA({ usuarioActual, modoDemo = false }) {
  const usuarioId = usuarioActual?.id ?? null;
  const [configuracion, setConfiguracion] = useState(CONFIGURACION_IA_DEMO);
  const [cargos, setCargos] = useState(PERFILES_CARGO_DEMO);
  const [cargando, setCargando] = useState(!modoDemo);
  const [guardandoConfiguracion, setGuardandoConfiguracion] = useState(false);
  const [guardandoCargoId, setGuardandoCargoId] = useState(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    let activo = true;

    async function cargar() {
      if (modoDemo) {
        setConfiguracion({ ...CONFIGURACION_IA_DEMO });
        setCargos(PERFILES_CARGO_DEMO.map((cargo) => ({ ...cargo })));
        setCargando(false);
        return;
      }

      setCargando(true);
      setError('');

      try {
        const [configuracionDb, cargosDb] = await Promise.all([
          obtenerConfiguracionIA(usuarioId),
          listarCargosIA(usuarioId)
        ]);

        if (!activo) return;

        setConfiguracion(configuracionDb);
        setCargos(cargosDb);
      } catch (err) {
        if (!activo) return;
        setError(err.message || 'No fue posible cargar la configuración IA.');
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [modoDemo, usuarioId]);

  const actualizarConfiguracion = (campo, valor) => {
    setConfiguracion((prev) => ({ ...prev, [campo]: valor }));
  };

  const actualizarPerfil = (cargoId, valor) => {
    setCargos((prev) =>
      prev.map((cargo) =>
        cargo.id === cargoId ? { ...cargo, perfilIA: valor } : cargo
      )
    );
  };

  const handleGuardarConfiguracion = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');
    setGuardandoConfiguracion(true);

    try {
      if (modoDemo) {
        setConfiguracion((prev) => ({
          ...prev,
          updatedAt: new Date().toISOString(),
          updatedByNombre: usuarioActual?.nombre || 'Administrador demo'
        }));
      } else {
        await guardarConfiguracionIA(configuracion, usuarioId);
        const actualizada = await obtenerConfiguracionIA(usuarioId);
        setConfiguracion(actualizada);
      }
      setMensaje('Configuración IA guardada correctamente.');
    } catch (err) {
      setError(err.message || 'No fue posible guardar la configuración IA.');
    } finally {
      setGuardandoConfiguracion(false);
    }
  };

  const handleGuardarPerfil = async (cargo) => {
    setError('');
    setMensaje('');
    setGuardandoCargoId(cargo.id);

    try {
      if (modoDemo) {
        setCargos((prev) =>
          prev.map((item) =>
            item.id === cargo.id
              ? { ...item, updatedAt: new Date().toISOString() }
              : item
          )
        );
      } else {
        await guardarPerfilCargoIA(cargo.id, cargo.perfilIA, usuarioId);
        setCargos((prev) =>
          prev.map((item) =>
            item.id === cargo.id
              ? { ...item, updatedAt: new Date().toISOString() }
              : item
          )
        );
      }
      setMensaje(`Perfil IA actualizado para ${cargo.nombre}.`);
    } catch (err) {
      setError(err.message || 'No fue posible guardar el perfil del cargo.');
    } finally {
      setGuardandoCargoId(null);
    }
  };

  if (cargando) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5 text-muted">
          <span className="spinner-border spinner-border-sm me-2"></span>
          Cargando configuración IA...
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {error && <div className="alert alert-danger py-2 small mb-0">{error}</div>}
      {mensaje && <div className="alert alert-success py-2 small mb-0">{mensaje}</div>}

      <form className="card border-0 shadow-sm" onSubmit={handleGuardarConfiguracion}>
        <div className="card-body p-4">
          <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
            <div>
              <h5 className="fw-bold mb-1">Configuración general de la IA</h5>
              <p className="text-muted small mb-0">
                Define el comportamiento base y el prompt de análisis de CV. Esta información solo la administra un usuario ADMIN.
              </p>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="iaActiva"
                checked={Boolean(configuracion.activo)}
                onChange={(e) => actualizarConfiguracion('activo', e.target.checked)}
              />
              <label className="form-check-label small" htmlFor="iaActiva">
                Activa
              </label>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Proveedor</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={configuracion.proveedor}
                onChange={(e) => actualizarConfiguracion('proveedor', e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-semibold">Modelo</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={configuracion.modelo}
                onChange={(e) => actualizarConfiguracion('modelo', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Temperatura</label>
              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                className="form-control form-control-sm"
                value={configuracion.temperatura}
                onChange={(e) => actualizarConfiguracion('temperatura', e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">Máx. tokens</label>
              <input
                type="number"
                min="100"
                step="100"
                className="form-control form-control-sm"
                value={configuracion.maxTokens}
                onChange={(e) => actualizarConfiguracion('maxTokens', e.target.value)}
              />
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold">System prompt</label>
              <textarea
                rows="5"
                className="form-control form-control-sm"
                value={configuracion.systemPrompt}
                onChange={(e) => actualizarConfiguracion('systemPrompt', e.target.value)}
              ></textarea>
            </div>

            <div className="col-12">
              <label className="form-label small fw-semibold">Prompt de análisis</label>
              <textarea
                rows="5"
                className="form-control form-control-sm"
                value={configuracion.promptAnalisis}
                onChange={(e) => actualizarConfiguracion('promptAnalisis', e.target.value)}
              ></textarea>
            </div>

            <div className="col-12 d-flex flex-column flex-md-row justify-content-between gap-2">
              <span className="small text-muted">
                Última actualización: <strong>{formatearFecha(configuracion.updatedAt)}</strong>
                {configuracion.updatedByNombre ? ` por ${configuracion.updatedByNombre}` : ''}
              </span>
              <button
                type="submit"
                className="btn btn-primary btn-sm px-4"
                disabled={guardandoConfiguracion}
              >
                {guardandoConfiguracion ? 'Guardando...' : 'Guardar configuración'}
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="mb-3">
            <h5 className="fw-bold mb-1">Detalle de cargos para compatibilidad</h5>
            <p className="text-muted small mb-0">
              Este perfil se usará como referencia para comparar el CV y calcular la compatibilidad.
            </p>
          </div>

          <div className="d-flex flex-column gap-3">
            {cargos.map((cargo) => (
              <div className="p-3 bg-light rounded-3 border" key={cargo.id}>
                <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-2">
                  <div>
                    <div className="fw-semibold text-dark">{cargo.nombre}</div>
                    <div className="text-muted small">{cargo.familiaCargo}</div>
                  </div>
                  <span className="small text-muted">
                    Actualizado: {formatearFecha(cargo.updatedAt)}
                  </span>
                </div>
                <textarea
                  rows="3"
                  className="form-control form-control-sm"
                  value={cargo.perfilIA || ''}
                  onChange={(e) => actualizarPerfil(cargo.id, e.target.value)}
                  placeholder="Describe funciones, requisitos, competencias y alertas esperadas para este cargo."
                ></textarea>
                <div className="text-end mt-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleGuardarPerfil(cargo)}
                    disabled={guardandoCargoId === cargo.id}
                  >
                    {guardandoCargoId === cargo.id ? 'Guardando...' : 'Guardar perfil'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
