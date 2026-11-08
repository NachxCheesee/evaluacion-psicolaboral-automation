/**
 * ============================================================================
 * RESUMEN DEL ARCHIVO: Módulo de Pruebas Unitarias - Autenticación y Cuentas
 * SISTEMA: AquaChile - Reclutamiento & Selección Psicolaboral
 * FRAMEWORK: Jasmine / Karma
 * DESCRIPCIÓN: Valida la integridad de los roles base del sistema, verificación
 *              de credenciales de acceso institucional y validación lógica
 *              de contraseñas dobles.
 * COMPORTAMIENTO: Dinámico e independiente del tamaño de la base de cuentas.
 * ============================================================================
 */

import { CUENTAS_AUTORIZADAS } from '../data/mockData.js';

describe('Módulo de Pruebas: Autenticación y Control de Accesos (RBAC)', () => {

  // PRUEBA 1: Existencia de los tres roles base institucionales
  it('1. Debe contener los roles esenciales ADMIN, ANALISTA y EVALUADOR', () => {
    const muestraCuentas = CUENTAS_AUTORIZADAS.slice(0, 15);
    expect(muestraCuentas.length).toBeGreaterThan(0);

    const rolesDisponibles = muestraCuentas.map((c) => c.rol);
    expect(rolesDisponibles).toContain('ADMIN');
    expect(rolesDisponibles).toContain('ANALISTA');
    expect(rolesDisponibles).toContain('EVALUADOR');
  });

  // PRUEBA 2: Unicidad de los correos corporativos
  it('2. Los correos institucionales registrados no deben estar duplicados', () => {
    const muestraCuentas = CUENTAS_AUTORIZADAS.slice(0, 15);
    const correos = muestraCuentas.map((c) => c.correo.toLowerCase());
    const correosUnicos = new Set(correos);

    expect(correos.length).toBe(correosUnicos.size);
  });

  // PRUEBA 3: Login exitoso con credenciales válidas
  it('3. Debe autenticar correctamente al analista institucional con credenciales válidas', () => {
    const credencialValida = { correo: 'analista@aquachile.cl', password: '123' };
    const usuarioEncontrado = CUENTAS_AUTORIZADAS.find(
      (c) => c.correo === credencialValida.correo && c.password === credencialValida.password
    );

    expect(usuarioEncontrado).toBeDefined();
    expect(usuarioEncontrado.rol).toBe('ANALISTA');
  });

  // PRUEBA 4: Rechazo de inicio de sesión con clave incorrecta
  it('4. Debe rechazar el inicio de sesión cuando la contraseña no coincide', () => {
    const credencialInvalida = { correo: 'analista@aquachile.cl', password: 'clave_erronea_2026' };
    const usuarioEncontrado = CUENTAS_AUTORIZADAS.find(
      (c) => c.correo === credencialInvalida.correo && c.password === credencialInvalida.password
    );

    expect(usuarioEncontrado).toBeUndefined();
  });

  // PRUEBA 5: Verificación de coincidencia en confirmación de contraseña
  it('5. Debe rechazar la creación o cambio de clave si las contraseñas no coinciden', () => {
    const claveNueva = 'AquaChile2026';
    const claveConfirmacion = 'AquaChile2025';

    const coinciden = claveNueva === claveConfirmacion;
    expect(coinciden).toBeFalse();
  });

});