import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../services/ofertas', () => ({
  listarOfertasPublicas: vi.fn()
}));

import { listarOfertasPublicas } from '../services/ofertas';
import OfertasPage from '../pages/OfertasPage';

const OFERTAS = [
  {
    id: 1,
    cargo: 'Operario de Planta',
    categoria: 'Operario Calificado',
    ubicacion: 'Puerto Montt',
    modalidad: 'PRESENCIAL',
    fechaPublicacion: '2026-11-20',
    cupos: 3,
    descripcion: 'Trabajo en planta.',
    publicada: true
  },
  {
    id: 2,
    cargo: 'Analista de Laboratorio',
    categoria: 'Profesional',
    ubicacion: 'Puerto Varas',
    modalidad: 'HIBRIDA',
    fechaPublicacion: '2026-11-21',
    cupos: 1,
    descripcion: 'Análisis microbiológico.',
    publicada: true
  }
];

describe('OfertasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista, filtra por categoría y muestra estado vacío', async () => {
    listarOfertasPublicas.mockResolvedValue(OFERTAS);
    render(<MemoryRouter><OfertasPage /></MemoryRouter>);

    expect(await screen.findByText('Operario de Planta')).toBeInTheDocument();
    expect(screen.getByText('Analista de Laboratorio')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText('Categoría'), 'Profesional');

    expect(screen.queryByText('Operario de Planta')).not.toBeInTheDocument();
    expect(screen.getByText('Analista de Laboratorio')).toBeInTheDocument();
  });

  it('muestra error de carga', async () => {
    listarOfertasPublicas.mockRejectedValue(new Error('sin conexión'));
    render(<MemoryRouter><OfertasPage /></MemoryRouter>);

    expect(await screen.findByText('sin conexión')).toBeInTheDocument();
  });
});
