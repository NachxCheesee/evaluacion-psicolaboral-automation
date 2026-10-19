import { supabase, errorSupabaseNoConfigurado } from "../lib/supabaseClient";

// Devuelve el cliente o lanza un error claro si falta configurar el .env
export function cliente() {
  if (!supabase) throw errorSupabaseNoConfigurado();
  return supabase;
}

// Ejecuta una consulta de supabase-js ({ data, error }) y unifica los errores
export async function resolver(consulta) {
  let resultado;
  try {
    resultado = await consulta;
  } catch (e) {
    throw new Error(`No se pudo conectar con Supabase: ${e.message}`, { cause: e });
  }
  if (resultado?.error) {
    const error = resultado.error;
    // Sin código SQL = falló la conexión (red/URL mal escrita), no la BD
    if (!error.code && /fetch failed|network|load failed/i.test(error.message || "")) {
      throw new Error(
        `No se pudo conectar con Supabase. Revisa tu conexión y la VITE_SUPABASE_URL del .env. (${error.message})`,
        { cause: error }
      );
    }
    throw new Error(`Supabase: ${error.message}`);
  }
  return resultado?.data;
}
