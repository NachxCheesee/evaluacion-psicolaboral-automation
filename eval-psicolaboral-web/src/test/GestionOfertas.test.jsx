import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../services/ofertas', () => ({
  actualizarEstadoPostulacion: vi.fn(),
  actualizarOferta: vi.fn(),
  crearOferta: vi.fn(),
  despublicarOferta: vi.fn(),
  eliminarOferta: vi.fn(),
  listarOfertasAdmin: vi.fn(),
  listarPostulacionesOferta: vi.fn(),
  publicarOferta: vi.fn()
}));

import {
  actualizarEstadoPostulacion,
  actualizarOferta,
  crearOferta,
  despublicarOferta,
  eliminarOferta,
  listarOfertasAdmin,
  listarPostulacionesOferta,
  publicarOferta
} from '../services/ofertas';
import GestionOfertas from '../components/ofertas/GestionOfertas';

const OFERTA = {
  id: 1,
  cargo: 'Operario',
  categoria: 'Operario Calificado',
  ubicacion: 'Puerto Montt',
  modalidad: 'PRESENCIAL',
  fechaPublicacion: '2026-11-20',
  cupos: 2,
  descripcion: 'Desc',
  funciones: 'Func',
  requisitos: 'Req',
  beneficios: 'Ben',
  sueldo: '$900.000',
  publicada: false,
  responsableId: 2
};

const POSTULACION = {
  id: 9,
  postulanteNombre: 'Juan Pérez',
  postulanteRut: '12345678-9',
  solicitudId: 20,
  cvNombre: 'cv.pdf',
  estado: 'RECIBIDA'
};

describe('GestionOfertas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listarOfertasAdmin.mockResolvedValue([OFERTA]);
    listarPostulacionesOferta.mockResolvedValue([POSTULACION]);
    crearOferta.mockResolvedValue({ id: 2 });
    actualizarOferta.mockResolvedValue({ id: 1 });
    publicarOferta.mockResolvedValue({ id: 1, publicada: true });
    despublicarOferta.mockResolvedValue({ id: 1, publicada: false });
    eliminarOferta.mockResolvedValue(null);
    actualizarEstadoPostulacion.mockResolvedValue({ id: 9, estado: 'EN_REVISION' });
    window.confirm = vi.fn().mockReturnValue(true);
  });

  it('lista ofertas y crea una nueva', async () => {
    render(<GestionOfertas cuentas={[{ id: 2, nombre: 'Camila', rol: 'ANALISTA' }]} />);
    expect(await screen.findByText('Operario')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Nueva oferta/i }));

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], 'Técnico');
    await user.type(inputs[1], 'Profesional');
    await user.type(inputs[2], 'Castro');
    await user.click(screen.getByRole('button', { name: /Guardar oferta/i }));

    await waitFor(() => expect(crearOferta).toHaveBeenCalled());
  });

  it('edita, publica, despublica y elimina', async () => {
    render(<GestionOfertas cuentas={[]} />);
    await screen.findByText('Operario');
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Editar' }));
    await user.click(screen.getByRole('button', { name: /Guardar oferta/i }));
    await waitFor(() => expect(actualizarOferta).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: 'Publicar' }));
    await waitFor(() => expect(publicarOferta).toHaveBeenCalled());

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(eliminarOferta).toHaveBeenCalled());
  });

  it('gestiona postulaciones y su estado', async () => {
    render(<GestionOfertas cuentas={[]} />);
    await screen.findByText('Operario');
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Postulaciones' }));
    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument();

    const select = screen.getByRole('combobox', { name: '' });
    await user.selectOptions(select, 'EN_REVISION');
    await waitFor(() => expect(actualizarEstadoPostulacion).toHaveBeenCalledWith(9, 'EN_REVISION'));
  });
});
