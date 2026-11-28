import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    del: vi.fn(),
    postForm: vi.fn()
  }
}));

import { api } from '../lib/api';
import {
  actualizarEstadoPostulacion,
  actualizarOferta,
  crearOferta,
  despublicarOferta,
  eliminarOferta,
  listarOfertasAdmin,
  listarOfertasPublicas,
  listarPostulacionesOferta,
  obtenerOfertaPublica,
  postularOferta,
  publicarOferta
} from '../services/ofertas';

describe('services/ofertas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama endpoints públicos con y sin categoría', async () => {
    api.get.mockResolvedValue([]);

    await listarOfertasPublicas();
    await listarOfertasPublicas('Todas');
    await listarOfertasPublicas('Operario Calificado');
    await obtenerOfertaPublica(3);

    expect(api.get).toHaveBeenNthCalledWith(1, '/api/ofertas/publicas');
    expect(api.get).toHaveBeenNthCalledWith(2, '/api/ofertas/publicas');
    expect(api.get).toHaveBeenNthCalledWith(3, '/api/ofertas/publicas?categoria=Operario%20Calificado');
    expect(api.get).toHaveBeenNthCalledWith(4, '/api/ofertas/publicas/3');
  });

  it('ejecuta CRUD y publicación admin', async () => {
    api.get.mockResolvedValue([]);
    api.post.mockResolvedValue({ id: 1 });
    api.put.mockResolvedValue({ id: 1 });
    api.patch.mockResolvedValue({ id: 1 });
    api.del.mockResolvedValue(null);

    await listarOfertasAdmin('Profesional');
    await crearOferta({ cargo: 'X' });
    await actualizarOferta(1, { cargo: 'Y' });
    await publicarOferta(1);
    await despublicarOferta(1);
    await eliminarOferta(1);
    await listarPostulacionesOferta(1);
    await actualizarEstadoPostulacion(2, 'EN_REVISION');

    expect(api.get).toHaveBeenCalledWith('/api/ofertas?categoria=Profesional');
    expect(api.post).toHaveBeenCalledWith('/api/ofertas', { cargo: 'X' });
    expect(api.put).toHaveBeenCalledWith('/api/ofertas/1', { cargo: 'Y' });
    expect(api.patch).toHaveBeenCalledWith('/api/ofertas/1/publicar');
    expect(api.patch).toHaveBeenCalledWith('/api/ofertas/1/despublicar');
    expect(api.del).toHaveBeenCalledWith('/api/ofertas/1');
    expect(api.get).toHaveBeenCalledWith('/api/ofertas/1/postulaciones');
    expect(api.patch).toHaveBeenCalledWith('/api/postulaciones/2/estado', { estado: 'EN_REVISION' });
  });

  it('arma FormData de postulación con datos JSON y CV', async () => {
    api.postForm.mockResolvedValue({ id: 9 });
    const cv = new File(['pdf'], 'cv.pdf', { type: 'application/pdf' });

    const response = await postularOferta(3, { nombre: 'Juan' }, cv);

    expect(response.id).toBe(9);
    const [path, formData] = api.postForm.mock.calls[0];
    expect(path).toBe('/api/ofertas/publicas/3/postular');
    expect(formData.get('cv').name).toBe('cv.pdf');
    expect(formData.get('datos')).toBeInstanceOf(Blob);
  });
});
