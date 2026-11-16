import { cliente, resolver, llamarRpc } from "./conexion";

const CAMPOS = [
  "id",
  "nombre",
  "correo",
  "rol",
  "titulo_rol",
  "fecha_alta",
  "rol_nombre",
  "estado_nombre",
  "ultimo_acceso",
  "permisos"
].join(", ");

// Fila de vw_usuarios_publicos o resultado de login_usuario -> usuario UI
export function mapearCuenta(fila) {
  if (!fila) return null;

  return {
    id: fila.id,
    nombre: fila.nombre,
    correo: fila.correo,
    rol: fila.rol,
    tituloRol: fila.titulo_rol,
    rolNombre: fila.rol_nombre,
    estado: fila.estado_nombre || fila.estado || "Activo",
    fechaAlta: fila.fecha_alta,
    ultimoAcceso: fila.ultimo_acceso,
    permisos: fila.permisos || []
  };
}

export async function listarCuentas() {
  const filas = await resolver(
    cliente()
      .from("vw_usuarios_publicos")
      .select(CAMPOS)
      .order("nombre", { ascending: true })
  );
  return (filas || []).map(mapearCuenta);
}

export async function loginUsuario(correo, password) {
  const data = await llamarRpc("login_usuario", {
    p_correo: correo,
    p_password: password
  });

  const fila = Array.isArray(data) ? data[0] : data;
  return mapearCuenta(fila);
}

export async function crearCuenta(cuenta, usuarioId) {
  return llamarRpc("crear_usuario", {
    p_nombre: cuenta.nombre,
    p_correo: cuenta.correo,
    p_rol: cuenta.rol,
    p_password: cuenta.password,
    p_usuario_id: usuarioId
  });
}

export async function actualizarCuenta(cuenta, usuarioId) {
  return llamarRpc("actualizar_usuario", {
    p_id: cuenta.id,
    p_nombre: cuenta.nombre,
    p_correo: cuenta.correo,
    p_rol: cuenta.rol,
    p_password: cuenta.nuevaPassword || null,
    p_usuario_id: usuarioId
  });
}

export async function eliminarCuenta(id, usuarioId) {
  return llamarRpc("eliminar_usuario", {
    p_id: id,
    p_usuario_id: usuarioId
  });
}
