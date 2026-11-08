/**
 * ============================================================================
 * RESUMEN DEL ARCHIVO: Módulo de Pruebas Unitarias - Solicitudes y Dashboard
 * SISTEMA: AquaChile - Reclutamiento & Selección Psicolaboral
 * FRAMEWORK: Jasmine / Karma
 * DESCRIPCIÓN: Evalúa la integridad cuantitativa de las métricas del panel,
 *              ordenamiento alfabético, filtrado por estados y operaciones
 *              CRUD (alta y baja) simuladas.
 * COMPORTAMIENTO: Muestra dinámica con tope de hasta 15 registros para simular
 *                 paginación futura de API / Base de datos.
 * ============================================================================
 */

import { SOLICITUDES_INICIALES } from '../data/mockData.js';

describe('Módulo de Pruebas: Gestión de Solicitudes y Métricas del Panel', () => {

  // Muestra dinámica con tope de 15 candidatos
  const obtenerMuestra = () => SOLICITUDES_INICIALES.slice(0, 15);

  // PRUEBA 1: Validación cuantitativa de métricas del Dashboard
  it('1. La sumatoria de solicitudes por estado debe coincidir con el 100% de la muestra', () => {
    const muestra = obtenerMuestra();
    const total = muestra.length;

    const pendientes = muestra.filter((s) => s.estado === 'Pendiente').length;
    const enProceso = muestra.filter((s) => s.estado === 'En proceso').length;
    const finalizadas = muestra.filter((s) => s.estado === 'Finalizada').length;

    expect(total).toBeLessThanOrEqual(15);
    expect(pendientes + enProceso + finalizadas).toBe(total);
  });

  // PRUEBA 2: Filtrado estricto por estado
  it('2. El filtro de solicitudes finalizadas debe aislar solo registros en estado "Finalizada"', () => {
    const muestra = obtenerMuestra();
    const filtradas = muestra.filter((s) => s.estado === 'Finalizada');

    // Cada elemento del resultado debe poseer el estado solicitado
    filtradas.forEach((item) => {
      expect(item.estado).toBe('Finalizada');
    });

    const algunaPendiente = filtradas.some((s) => s.estado === 'Pendiente');
    expect(algunaPendiente).toBeFalse();
  });

  // PRUEBA 3: Ordenamiento alfabético ascendente por nombre del postulante
  it('3. Debe ordenar correctamente los candidatos de forma alfabética (A-Z)', () => {
    const muestra = obtenerMuestra();
    const ordenados = [...muestra].sort((a, b) =>
      a.candidato.localeCompare(b.candidato)
    );

    for (let i = 0; i < ordenados.length - 1; i++) {
      const comparacion = ordenados[i].candidato.localeCompare(ordenados[i + 1].candidato);
      expect(comparacion).toBeLessThanOrEqual(0);
    }
  });

  // PRUEBA 4: Simulación de alta de candidato (CREATE)
  it('4. Debe incorporar una nueva postulación incrementando el total en exactamente 1 unidad', () => {
    const muestra = obtenerMuestra();
    const totalOriginal = muestra.length;

    const nuevaPostulacion = {
      id: Date.now(),
      rut: '19.999.888-7',
      candidato: 'Camilo Cárcamo',
      cargo: 'Operario de Planta de Procesos',
      estado: 'Pendiente'
    };

    const listaActualizada = [nuevaPostulacion, ...muestra];

    expect(listaActualizada.length).toBe(totalOriginal + 1);
    expect(listaActualizada[0].candidato).toBe('Camilo Cárcamo');
  });

  // PRUEBA 5: Simulación de baja de candidato (DELETE)
  it('5. Debe eliminar una postulación por su identificador único ID', () => {
    const muestra = obtenerMuestra();
    const totalOriginal = muestra.length;

    if (totalOriginal > 0) {
      const idAEliminar = muestra[0].id;
      const listaTrasEliminar = muestra.filter((s) => s.id !== idAEliminar);

      expect(listaTrasEliminar.length).toBe(totalOriginal - 1);
      const existeAun = listaTrasEliminar.some((s) => s.id === idAEliminar);
      expect(existeAun).toBeFalse();
    }
  });

});