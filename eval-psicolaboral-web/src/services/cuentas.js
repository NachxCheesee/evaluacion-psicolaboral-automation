import { api } from "../lib/api";

// Backend UsuarioResponse -> forma que usa la UI
function aCuenta(u) {
  return {
    id: u.id,
    nombre: u.nombre,
    correo: u.correo,
    rol: u.rol,
    tituloRol: u.tituloRol || "",
    fechaAlta: u.fechaAlta || null,
    password: ""
  };
}

export async function listarCuentas() {
  const data = await api.get("/api/usuarios");
  return (data || []).map(aCuenta);
}

export async function crearCuenta(cuenta) {
  const u = await api.post("/api/usuarios", {
    correo: cuenta.correo,
    password: cuenta.password,
    nombre: cuenta.nombre,
    rol: cuenta.rol,
    tituloRol: cuenta.tituloRol || null
  });
  return aCuenta(u);
}

export async function actualizarCuenta(cuenta) {
  const u = await api.put(`/api/usuarios/${cuenta.id}`, {
    correo: cuenta.correo,
    password: cuenta.password || null,
    nombre: cuenta.nombre,
    rol: cuenta.rol,
    tituloRol: cuenta.tituloRol || null
  });
  return aCuenta(u);
}

export async function eliminarCuenta(id) {
  await api.del(`/api/usuarios/${id}`);
}
