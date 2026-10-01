import { SOLICITUDES_INICIALES, CUENTAS_AUTORIZADAS } from '../data/mockData.js';

// Función auxiliar de normalización de RUT
const normalizarRut = (texto) => {
  if (!texto) return '';
  return texto.toString().replace(/[^0-9kK]/g, '').toLowerCase();
};

describe('Batería de Pruebas Unitarias - Sistema AquaChile (10/10)', () => {

  // PRUEBA 1: Verificación de cuentas autorizadas por defecto
  it('1. Debe contener las 3 cuentas institucionales base (Admin, Analista, Evaluador)', () => {
    expect(CUENTAS_AUTORIZADAS.length).toBe(3);
    const roles = CUENTAS_AUTORIZADAS.map(c => c.rol);
    expect(roles).toContain('ADMIN');
    expect(roles).toContain('ANALISTA');
    expect(roles).toContain('EVALUADOR');
  });

  // PRUEBA 2: Validación de credenciales correctas en login
  it('2. Debe autenticar correctamente al analista con credenciales válidas', () => {
    const credencial = { correo: 'analista@aquachile.cl', password: '123' };
    const usuario = CUENTAS_AUTORIZADAS.find(
      c => c.correo === credencial.correo && c.password === credencial.password
    );
    expect(usuario).toBeDefined();
    expect(usuario.rol).toBe('ANALISTA');
  });

  // PRUEBA 3: Rechazo de credenciales incorrectas en login
  it('3. Debe rechazar el inicio de sesión con clave incorrecta', () => {
    const credencial = { correo: 'analista@aquachile.cl', password: 'clave_invalida' };
    const usuario = CUENTAS_AUTORIZADAS.find(
      c => c.correo === credencial.correo && c.password === credencial.password
    );
    expect(usuario).toBeUndefined();
  });

  // PRUEBA 4: Cálculo cuantitativo de métricas del Dashboard
  it('4. Debe calcular cuantitativamente las solicitudes según su estado', () => {
    const total = SOLICITUDES_INICIALES.length;
    const pendientes = SOLICITUDES_INICIALES.filter(s => s.estado === 'Pendiente').length;
    const enProceso = SOLICITUDES_INICIALES.filter(s => s.estado === 'En proceso').length;
    const finalizadas = SOLICITUDES_INICIALES.filter(s => s.estado === 'Finalizada').length;

    expect(total).toBe(3);
    expect(pendientes).toBe(1);
    expect(enProceso).toBe(1);
    expect(finalizadas).toBe(1);
  });

  // PRUEBA 5: Normalización de RUT eliminando puntos y guión
  it('5. Debe limpiar caracteres especiales del RUT para permitir búsqueda flexible', () => {
    const rutConFormato = '18.342.195-2';
    const rutLimpio = normalizarRut(rutConFormato);
    expect(rutLimpio).toBe('183421952');
  });

  // PRUEBA 6: Búsqueda flexible de postulante por RUT
  it('6. Debe encontrar un candidato buscando por RUT sin puntos ni guión', () => {
    const terminoBusqueda = '183421952';
    const resultado = SOLICITUDES_INICIALES.filter(s => 
      normalizarRut(s.rut).includes(terminoBusqueda)
    );
    expect(resultado.length).toBe(1);
    expect(resultado[0].candidato).toBe('Esteban Morales');
  });

  // PRUEBA 7: Filtrado de solicitudes por estado
  it('7. Debe filtrar únicamente las solicitudes en estado Finalizada', () => {
    const filtro = 'Finalizada';
    const filtradas = SOLICITUDES_INICIALES.filter(s => s.estado === filtro);
    expect(filtradas.length).toBe(1);
    expect(filtradas[0].candidato).toBe('Rodrigo Valenzuela');
  });

  // PRUEBA 8: Ordenamiento alfabético ascendente por nombre
  it('8. Debe ordenar los candidatos alfabéticamente de la A a la Z', () => {
    const ordenados = [...SOLICITUDES_INICIALES].sort((a, b) => 
      a.candidato.localeCompare(b.candidato)
    );
    expect(ordenados[0].candidato).toBe('Carolina Ríos');
    expect(ordenados[1].candidato).toBe('Esteban Morales');
    expect(ordenados[2].candidato).toBe('Rodrigo Valenzuela');
  });

  // PRUEBA 9: Simulación de alta de candidato (CREATE)
  it('9. Debe agregar una nueva solicitud preservando la integridad de los datos', () => {
    const nueva = {
      id: 99,
      rut: '20.111.222-3',
      candidato: 'Valeria Castro',
      estado: 'Pendiente'
    };
    const listaActualizada = [nueva, ...SOLICITUDES_INICIALES];
    expect(listaActualizada.length).toBe(4);
    expect(listaActualizada[0].candidato).toBe('Valeria Castro');
  });

  // PRUEBA 10: Simulación de baja de candidato (DELETE)
  it('10. Debe eliminar una solicitud por su ID correctamente', () => {
    const idAEliminar = 1;
    const listaFiltrada = SOLICITUDES_INICIALES.filter(s => s.id !== idAEliminar);
    expect(listaFiltrada.length).toBe(2);
    expect(listaFiltrada.some(s => s.id === 1)).toBeFalse();
  });

});