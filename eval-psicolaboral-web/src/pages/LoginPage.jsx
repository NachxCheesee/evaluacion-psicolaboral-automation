import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage({ onLogin, mostrarAccesosDemo = false }) {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [ingresando, setIngresando] = useState(false);
  const navigate = useNavigate();

  const iniciarSesion = async (correoIngreso, passwordIngreso) => {
    setError('');
    setIngresando(true);

    try {
      await onLogin(correoIngreso, passwordIngreso);
      navigate('/panel');
    } catch (err) {
      setError(err.message || 'No fue posible iniciar sesión.');
    } finally {
      setIngresando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await iniciarSesion(correo, password);
  };

  const accesoDemo = async (emailDemo, passDemo) => {
    setCorreo(emailDemo);
    setPassword(passDemo);
    await iniciarSesion(emailDemo, passDemo);
  };

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light py-4 px-3">
      <div className="card shadow-sm border-0" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h4 className="fw-bold text-primary mb-1">AquaChile</h4>
            <span className="text-muted small">Portal de Gestión Psicolaboral</span>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Correo Institucional</label>
              <input
                type="email"
                className="form-control form-control-sm"
                placeholder="ejemplo@aquachile.cl"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                disabled={ingresando}
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Contraseña</label>
              <input
                type="password"
                className="form-control form-control-sm"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={ingresando}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-sm w-100 fw-semibold py-2 mb-3"
              disabled={ingresando}
            >
              {ingresando ? 'Ingresando...' : 'Ingresar al Panel'}
            </button>
          </form>

          <div className="text-center mb-3">
            <Link to="/" className="text-decoration-none small text-muted">
              ← Volver al sitio principal
            </Link>
          </div>

          {mostrarAccesosDemo && (
            <div className="border-top pt-3">
              <span className="d-block small text-muted mb-2 text-center">
                Acceso directo de demostración:
              </span>
              <div className="d-flex flex-column gap-1">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm text-start"
                  onClick={() => accesoDemo('admin@aquachile.cl', '123')}
                  disabled={ingresando}
                >
                  <strong>Admin:</strong> admin@aquachile.cl
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm text-start"
                  onClick={() => accesoDemo('analista@aquachile.cl', '123')}
                  disabled={ingresando}
                >
                  <strong>Analista:</strong> analista@aquachile.cl
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm text-start"
                  onClick={() => accesoDemo('evaluador@aquachile.cl', '123')}
                  disabled={ingresando}
                >
                  <strong>Evaluador:</strong> evaluador@aquachile.cl
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
