import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

function renderPage(onLogin = vi.fn().mockResolvedValue({})) {
  return render(
    <MemoryRouter>
      <LoginPage onLogin={onLogin} mostrarAccesosDemo />
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  it('inicia sesión con correo y contraseña', async () => {
    const onLogin = vi.fn().mockResolvedValue({});
    renderPage(onLogin);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('ejemplo@aquachile.cl'), 'admin@aquachile.cl');
    await user.type(screen.getByPlaceholderText('••••••'), '123');
    await user.click(screen.getByRole('button', { name: /Ingresar al Panel/i }));

    expect(onLogin).toHaveBeenCalledWith('admin@aquachile.cl', '123');
  });

  it('muestra error cuando el login falla', async () => {
    const onLogin = vi.fn().mockRejectedValue(new Error('Credenciales incorrectas.'));
    renderPage(onLogin);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText('ejemplo@aquachile.cl'), 'admin@aquachile.cl');
    await user.type(screen.getByPlaceholderText('••••••'), 'mala');
    await user.click(screen.getByRole('button', { name: /Ingresar al Panel/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales incorrectas.');
  });

  it('usa accesos demo', async () => {
    const onLogin = vi.fn().mockResolvedValue({});
    renderPage(onLogin);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Admin:/i }));
    expect(onLogin).toHaveBeenCalledWith('admin@aquachile.cl', '123');
  });
});
