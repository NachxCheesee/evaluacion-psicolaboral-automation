import { llamarRpc } from "./conexion";

export async function listarHistorial({ tabla = null, registroId = null, limit = 100 } = {}) {
  return llamarRpc("listar_historial", {
    p_tabla: tabla,
    p_registro_id: registroId,
    p_limit: limit
  });
}
