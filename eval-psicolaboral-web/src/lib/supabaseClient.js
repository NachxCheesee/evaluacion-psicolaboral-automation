import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// true cuando existe .env con URL y anon key reales (no placeholders)
export const supabaseConfigurado = Boolean(
  url &&
    anonKey &&
    /^https?:\/\//.test(url) &&
    !url.includes("TU-PROYECTO") &&
    anonKey !== "tu-anon-key-aqui"
);

export const supabase = supabaseConfigurado ? createClient(url, anonKey) : null;

export function errorSupabaseNoConfigurado() {
  return new Error(
    "Supabase no está configurado. Copia .env.example como .env y completa " +
      "VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY con los datos de tu proyecto."
  );
}
