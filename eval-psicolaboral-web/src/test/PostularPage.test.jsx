import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../services/ofertas', () => ({
  obtenerOfertaPublica: vi.fn(),
  postularOferta: vi.fn()
}));

import { obtenerOfertaPublica, postularOferta } from '../services/ofertas';
import PostularPage from '../pages/PostularPage';

const OFERTA = {
  id: 1,
  cargo: 'Operario de Planta de Procesos',
  categoria: 'Operario Calificado',
  ubicacion: 'Puerto Montt'
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/postular/1']}>
      <Routes>
        <Route path="/postular/:ofertaId" element={<PostularPage />} />
      </Routes>
    </MemoryRouter>
  );
}

async function llenarFormulario(container) {
  const user = userEvent.setup();
  await user.type(screen.getByPlaceholderText('Ej: 12.345.678-9'), '18.342.195-6');
  await user.type(screen.getByPlaceholderText('Ej: Juan Carlos Pérez Soto'), 'Juan Carlos Pérez Soto');
  await user.type(screen.getByPlaceholderText('+56 9 8765 4321'), '984512234');
  await user.type(screen.getByPlaceholderText('nombre.apellido@ejemplo.com'), 'juan@example.com');
  await user.type(screen.getByPlaceholderText('Ej: Puerto Montt, Castro, Calbuco, Quellón...'), 'Puerto Montt');
  const inputFile = container.querySelector('input[type="file"]');
  await user.upload(inputFile, new File(['%PDF-1'], 'cv.pdf', { type: 'application/pdf' }));
  return user;
}

describe('PostularPage con oferta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    obtenerOfertaPublica.mockResolvedValue(OFERTA);
    postularOferta.mockResolvedValue({ id: 10, solicitudId: 20 });
    window.scrollTo = vi.fn();
  });

  it('carga la oferta, valida y envía la postulación multipart', async () => {
    const { container } = renderPage();
    expect(await screen.findByText(/Postulación: Operario de Planta de Procesos/i)).toBeInTheDocument();

    const user = await llenarFormulario(container);
    await user.click(screen.getByRole('button', { name: /Confirmar y Enviar Postulación/i }));

    expect(postularOferta).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        nombre: 'Juan Carlos Pérez Soto',
        rut: '18.342.195-6',
        correo: 'juan@example.com',
        telefono: '984512234'
      }),
      expect.any(File)
    );
    expect(await screen.findByText(/Postulación Registrada Exitosamente/i)).toBeInTheDocument();
  });

  it('muestra validaciones y errores del backend', async () => {
    const { container } = renderPage();
    await screen.findByText(/Postulación: Operario de Planta de Procesos/i);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Confirmar y Enviar Postulación/i }));
    expect(await screen.findByText(/Existen campos incompletos/i)).toBeInTheDocument();

    postularOferta.mockRejectedValueOnce(new Error('La oferta no tiene cupos disponibles.'));
    await llenarFormulario(container);
    await user.click(screen.getByRole('button', { name: /Confirmar y Enviar Postulación/i }));
    expect(await screen.findByText('La oferta no tiene cupos disponibles.')).toBeInTheDocument();
  });
});
