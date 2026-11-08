/**
 * ============================================================================
 * RESUMEN DEL ARCHIVO: Módulo de Pruebas Unitarias - Algoritmos y Validaciones
 * SISTEMA: AquaChile - Reclutamiento & Selección Psicolaboral
 * FRAMEWORK: Jasmine / Karma
 * DESCRIPCIÓN: Verifica el funcionamiento del algoritmo Módulo 11 para RUT
 *              chileno, normalización fonética y de tildes para el buscador,
 *              y verificación de formato de telefonía móvil austral.
 * COMPORTAMIENTO: Funciones puras de validación de negocio.
 * ============================================================================
 */

// Algoritmo matemático oficial Módulo 11
const validarRutChileno = (rutCompleto) => {
  if (!rutCompleto) return false;
  const limpio = rutCompleto.replace(/[^0-9kK]/g, '').toUpperCase();
  if (limpio.length < 8 || limpio.length > 9) return false;

  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);

  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const resto = suma % 11;
  const dvEsperado = 11 - resto;
  let dvCalculado = '0';

  if (dvEsperado === 11) dvCalculado = '0';
  else if (dvEsperado === 10) dvCalculado = 'K';
  else dvCalculado = dvEsperado.toString();

  return dv === dvCalculado;
};

// Limpieza para búsqueda insensible a acentos y mayúsculas
const normalizarTexto = (texto) => {
  if (!texto) return '';
  return texto
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

// Validación de teléfonos móviles chilenos (+56 9 o 9 dígitos)
const validarTelefonoChileno = (telefono) => {
  if (!telefono) return false;
  const limpio = telefono.replace(/[^0-9]/g, '');
  return (limpio.length === 9 && limpio.startsWith('9')) ||
         (limpio.length === 11 && limpio.startsWith('569'));
};

describe('Módulo de Pruebas: Validaciones de Negocio y Algoritmos', () => {

    // PRUEBA 1: Validación de RUTs chilenos válidos con dígito verificador correcto
  it('1. Debe validar exitosamente RUTs chilenos reales con dígito verificador correcto', () => {
    expect(validarRutChileno('18.342.195-6')).toBeTrue();
    expect(validarRutChileno('15.892.401-3')).toBeTrue();
    expect(validarRutChileno('12.784.310-4')).toBeTrue();
    expect(validarRutChileno('19.124.883-K')).toBeTrue();
  });

  // PRUEBA 2: Rechazo de RUTs erróneos o manipulados
  it('2. Debe rechazar RUTs con dígito verificador adulterado o longitud insuficiente', () => {
    expect(validarRutChileno('18.342.195-9')).toBeFalse();
    expect(validarRutChileno('11.111.111-0')).toBeFalse();
    expect(validarRutChileno('12.345')).toBeFalse();
    expect(validarRutChileno('')).toBeFalse();
  });

  // PRUEBA 3: Normalización insensible a tildes y mayúsculas para el buscador
  it('3. Debe limpiar tildes y caracteres especiales para permitir búsquedas tolerantes', () => {
    const busquedaUsuario = normalizarTexto('Ríos');
    const busquedaSinTilde = normalizarTexto('rios');
    const nombreEnBase = normalizarTexto('Carolina Ríos');

    expect(busquedaUsuario).toBe('rios');
    expect(busquedaUsuario).toBe(busquedaSinTilde);
    expect(nombreEnBase.includes(busquedaSinTilde)).toBeTrue();
  });

  // PRUEBA 4: Verificación de números móviles chilenos
  it('4. Debe validar números celulares chilenos tanto en formato nacional como con código internacional', () => {
    expect(validarTelefonoChileno('+56 9 8451 2234')).toBeTrue();
    expect(validarTelefonoChileno('984512234')).toBeTrue();
    expect(validarTelefonoChileno('+56984512234')).toBeTrue();
  });

  // PRUEBA 5: Rechazo de números telefónicos inválidos
  it('5. Debe rechazar cadenas numéricas incompletas o de telefonía fija sin prefijo móvil', () => {
    expect(validarTelefonoChileno('65223344')).toBeFalse(); // Fijo de Puerto Montt sin 9
    expect(validarTelefonoChileno('12345')).toBeFalse();
    expect(validarTelefonoChileno('')).toBeFalse();
  });

});