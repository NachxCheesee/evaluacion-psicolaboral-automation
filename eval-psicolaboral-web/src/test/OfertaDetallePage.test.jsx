import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../services/ofertas', () => ({
  obtenerOfertaPublica: vi.fn()
}));

import { obtenerOfertaPublica } from '../services/ofertas';
import OfertaDetallePage from '../pages/OfertaDetallePage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/ofertas/1']}>
      <Routes>
        <Route path="/ofertas/:id" element={<OfertaDetallePage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('OfertaDetallePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el detalle completo y botón postular', async () => {
    obtenerOfertaPublica.mockResolvedValue({
      id: 1,
      cargo: 'Operario de Planta',
      categoria: 'Operario Calificado',
      ubicacion: 'Puerto Montt',
      modalidad: 'REMOTA',
      fechaPublicacion: '2026-11-20',
      cupos: 2,
      descripcion: 'Descripción',
      funciones: 'Funciones',
      requisitos: 'Requisitos',
      beneficios: 'Beneficios',
      sueldo: '$900.000',
      responsableNombre: 'Camila Muñoz'
    });

    renderPage();

    expect(await screen.findByRole('heading', { name: 'Operario de Planta' })).toBeInTheDocument();
    expect(screen.getAllByText('Funciones').length).toBeGreaterThan(0);
    expect(screen.getByText('$900.000')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Postular a esta oferta/i })).toHaveAttribute('href', '/postular/1');
  });

  it('muestra error si no existe la oferta', async () => {
    obtenerOfertaPublica.mockRejectedValue(new Error('La oferta no está publicada.'));
    renderPage();

    expect(await screen.findByText('La oferta no está publicada.')).toBeInTheDocument();
  });
});
