import { cliente, resolver } from "./conexion";

const CAMPOS = "id, correo, password, nombre, rol, titulo_rol, fecha_alta";

// Fila (snake_case) -> objeto de la UI (camelCase)
export function mapearCuenta(fila) {
  if (!fila) return null;
  return {
    id: fila.id,
    correo: fila.correo,
    password: fila.password,
    nombre: fila.nombre,
    rol: fila.rol,
    tituloRol: fila.titulo_rol,
    fechaAlta: fila.fecha_alta
  };
}

// Objeto de la UI (camelCase) -> fila (snake_case); el id lo asigna la BD.
// fecha_alta se omite si no viene, para que Postgres use su default.
function aFila(cuenta) {
  const fila = {
    correo: cuenta.correo,
    password: cuenta.password,
    nombre: cuenta.nombre,
    rol: cuenta.rol,
    titulo_rol: cuenta.tituloRol ?? null
  };
  if (cuenta.fechaAlta) fila.fecha_alta = cuenta.fechaAlta;
  return fila;
}

export async function listarCuentas() {
  const filas = await resolver(
    cliente().from("cuentas").select(CAMPOS).order("id", { ascending: true })
  );
  return (filas || []).map(mapearCuenta);
}

export async function crearCuenta(cuenta) {
  const fila = await resolver(
    cliente().from("cuentas").insert(aFila(cuenta)).select(CAMPOS).single()
  );
  return mapearCuenta(fila);
}

export async function actualizarCuenta(cuenta) {
  const fila = await resolver(
    cliente().from("cuentas").update(aFila(cuenta)).eq("id", cuenta.id).select(CAMPOS).single()
  );
  return mapearCuenta(fila);
}

export async function eliminarCuenta(id) {
  await resolver(cliente().from("cuentas").delete().eq("id", id));
}
