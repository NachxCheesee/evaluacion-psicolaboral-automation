import { beforeEach, describe, expect, it, vi } from 'vitest';

const jsonResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  headers: { get: () => 'application/json' },
  json: async () => data
});

describe('lib/api JWT', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it('guarda sesión al iniciar sesión y rechaza credenciales inválidas', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({
        accessToken: 'access',
        refreshToken: 'refresh',
        usuario: { id: 1, nombre: 'Admin', correo: 'admin@aquachile.cl', rol: 'ADMIN' }
      }))
      .mockResolvedValueOnce(jsonResponse({ message: 'Credenciales incorrectas.' }, 401));
    vi.stubGlobal('fetch', fetchMock);

    const apiModule = await import('../lib/api');

    const usuario = await apiModule.login('admin@aquachile.cl', '123');
    expect(usuario.nombre).toBe('Admin');
    expect(apiModule.estaAutenticado()).toBe(true);
    expect(apiModule.obtenerToken()).toBe('access');
    expect(apiModule.obtenerUsuario().rol).toBe('ADMIN');

    await expect(apiModule.login('admin@aquachile.cl', 'mala')).rejects.toThrow('Credenciales incorrectas.');
  });

  it('envía token, refresca en 401 y soporta POST/PUT/PATCH/DELETE/FormData', async () => {
    localStorage.setItem('aquachile_access_token', 'viejo');
    localStorage.setItem('aquachile_refresh_token', 'refresh');
    localStorage.setItem('aquachile_session', JSON.stringify({ id: 1 }));

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(jsonResponse({ accessToken: 'nuevo', refreshToken: 'refresh2', usuario: { id: 1 } }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
      .mockResolvedValueOnce(jsonResponse({ creado: true }))
      .mockResolvedValueOnce(jsonResponse({ actualizado: true }))
      .mockResolvedValueOnce(jsonResponse({ publicado: true }))
      .mockResolvedValueOnce({ ok: true, status: 204, headers: { get: () => '' } })
      .mockResolvedValueOnce(jsonResponse({ subido: true }));
    vi.stubGlobal('fetch', fetchMock);

    const { api } = await import('../lib/api');

    expect(await api.get('/recurso')).toEqual({ ok: true });
    expect(fetchMock.mock.calls[1][0]).toContain('/api/auth/refresh');

    await api.post('/x', { a: 1 });
    await api.put('/x/1', { a: 2 });
    await api.patch('/x/1/publicar');
    await api.del('/x/1');
    const form = new FormData();
    form.append('cv', new Blob(['pdf']), 'cv.pdf');
    await api.postForm('/upload', form);

    const ultimaLlamada = fetchMock.mock.calls.at(-1);
    expect(ultimaLlamada[0]).toContain('/upload');
    expect(ultimaLlamada[1].headers['Content-Type']).toBeUndefined();
  });

  it('limpia sesión al cerrar sesión aunque falle el backend', async () => {
    localStorage.setItem('aquachile_refresh_token', 'refresh');
    localStorage.setItem('aquachile_access_token', 'access');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('sin red')));

    const { logout, obtenerToken } = await import('../lib/api');
    await logout();

    expect(obtenerToken()).toBeNull();
    expect(localStorage.getItem('aquachile_refresh_token')).toBeNull();
  });

  it('maneja respuestas no JSON y errores sin mensaje', async () => {
    localStorage.setItem('aquachile_access_token', 'access');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: { get: () => '' },
      json: async () => { throw new Error('sin json'); }
    }));

    const { api } = await import('../lib/api');
    await expect(api.get('/error')).rejects.toThrow('Error 500');
  });
});
