import { llamarRpc } from "./conexion";

export const CONFIGURACION_IA_DEMO = {
  id: 1,
  activo: true,
  proveedor: "openai",
  modelo: "gpt-4.1-mini",
  systemPrompt:
    "Eres un analista senior de selección psicolaboral de AquaChile. Evalúa la compatibilidad entre el CV y el perfil del cargo, detectando brechas y posibles inconsistencias sin inventar información.",
  promptAnalisis:
    "Revisa el CV contra el perfil del cargo. Considera como alerta las certificaciones no acreditadas, experiencia sin fechas y contradicciones con la postulación.",
  temperatura: 0.2,
  maxTokens: 1200,
  updatedBy: 1,
  updatedByNombre: "Administrador General",
  updatedAt: "2026-11-26T10:00:00Z"
};

export const PERFILES_CARGO_DEMO = [
  {
    id: 1,
    nombre: "Operario de Planta de Procesos",
    familiaCargo: "Operario Calificado",
    perfilIA:
      "Ejecuta recepción, fileteo, calibrado, empaque y control de despacho. Requiere experiencia en turnos rotativos, inocuidad, EPP y trabajo en línea de frío.",
    updatedAt: "2026-11-26T10:00:00Z"
  },
  {
    id: 2,
    nombre: "Supervisor de Cultivo Agua Mar",
    familiaCargo: "Jefatura / Supervisión",
    perfilIA:
      "Supervisa cuadrillas de cultivo, biomasa, alimentación, limpieza de redes y registros de variables. Requiere liderazgo, bioseguridad y disponibilidad para faena.",
    updatedAt: "2026-11-26T10:00:00Z"
  },
  {
    id: 3,
    nombre: "Jefe de Mantención y Frío",
    familiaCargo: "Jefatura / Supervisión",
    perfilIA:
      "Planifica mantención preventiva y correctiva de equipos de frío, amoniaco, bombas y cámaras. Requiere experiencia industrial y liderazgo técnico.",
    updatedAt: "2026-11-26T10:00:00Z"
  },
  {
    id: 4,
    nombre: "Técnico de Alimentación y Fotoperíodo",
    familiaCargo: "Técnico Especialista",
    perfilIA:
      "Opera sistemas de alimentación, registra consumo, controla fotoperíodo y monitorea variables productivas. Requiere formación técnica acuícola.",
    updatedAt: "2026-11-26T10:00:00Z"
  },
  {
    id: 5,
    nombre: "Asistente de Aseguramiento de Calidad",
    familiaCargo: "Técnico Especialista",
    perfilIA:
      "Apoya auditorías internas, control documental, muestreos y verificación de inocuidad. Requiere experiencia en plantas de alimentos y manejo de registros.",
    updatedAt: "2026-11-26T10:00:00Z"
  },
  {
    id: 6,
    nombre: "Operador de Grúa Horquilla y Logística",
    familiaCargo: "Operario Calificado",
    perfilIA:
      "Opera grúa horquilla, carga y descarga, controla inventario y apoya la logística. Requiere licencia vigente, experiencia en bodega y seguridad.",
    updatedAt: "2026-11-26T10:00:00Z"
  },
  {
    id: 7,
    nombre: "Buzo Especialista en Redes y Fondeo",
    familiaCargo: "Técnico Especialista",
    perfilIA:
      "Realiza inspección y mantención subacuática de redes, fondeos y estructuras. Requiere certificación vigente, horas de inmersión y experiencia en centros de cultivo.",
    updatedAt: "2026-11-26T10:00:00Z"
  },
  {
    id: 8,
    nombre: "Analista de Laboratorio y Microbiología",
    familiaCargo: "Profesional",
    perfilIA:
      "Ejecuta análisis microbiológicos y fisicoquímicos, prepara muestras y registra resultados. Requiere formación en laboratorio y experiencia en microbiología.",
    updatedAt: "2026-11-26T10:00:00Z"
  },
  {
    id: 9,
    nombre: "Otro Cargo Operativo / Administrativo",
    familiaCargo: "Otros",
    perfilIA:
      "Perfil operativo o administrativo de apoyo. Se evalúan experiencia previa, organización, herramientas de oficina y adaptación al cargo.",
    updatedAt: "2026-11-26T10:00:00Z"
  },
  {
    id: 10,
    nombre: "Otro Cargo Operativo",
    familiaCargo: "Otros",
    perfilIA:
      "Perfil operativo de apoyo a planta o terreno. Se evalúan experiencia en faena, turnos, seguridad y trabajo en equipo.",
    updatedAt: "2026-11-26T10:00:00Z"
  }
];

export function mapearConfiguracionIA(fila) {
  if (!fila) return { ...CONFIGURACION_IA_DEMO };

  return {
    id: fila.id,
    activo: Boolean(fila.activo),
    proveedor: fila.proveedor || "",
    modelo: fila.modelo || "",
    systemPrompt: fila.system_prompt || "",
    promptAnalisis: fila.prompt_analisis || "",
    temperatura: Number(fila.temperatura ?? 0.2),
    maxTokens: Number(fila.max_tokens ?? 1200),
    updatedBy: fila.updated_by,
    updatedByNombre: fila.updated_by_nombre || "",
    updatedAt: fila.updated_at
  };
}

export async function obtenerConfiguracionIA(usuarioId) {
  const data = await llamarRpc("obtener_configuracion_ia", {
    p_usuario_id: usuarioId
  });
  const fila = Array.isArray(data) ? data[0] : data;
  return mapearConfiguracionIA(fila);
}

export async function guardarConfiguracionIA(configuracion, usuarioId) {
  return llamarRpc("guardar_configuracion_ia", {
    p_payload: {
      activo: Boolean(configuracion.activo),
      proveedor: configuracion.proveedor,
      modelo: configuracion.modelo,
      system_prompt: configuracion.systemPrompt,
      prompt_analisis: configuracion.promptAnalisis,
      temperatura: Number(configuracion.temperatura),
      max_tokens: Number(configuracion.maxTokens)
    },
    p_usuario_id: usuarioId
  });
}

export async function listarCargosIA(usuarioId) {
  const filas = await llamarRpc("listar_cargos_ia", {
    p_usuario_id: usuarioId
  });

  return (filas || []).map((fila) => ({
    id: fila.id,
    nombre: fila.nombre,
    familiaCargo: fila.familia_cargo || "Otros",
    perfilIA: fila.perfil_ia || "",
    updatedAt: fila.updated_at
  }));
}

export async function guardarPerfilCargoIA(cargoId, perfilIA, usuarioId) {
  return llamarRpc("guardar_perfil_cargo_ia", {
    p_cargo_id: cargoId,
    p_perfil_ia: perfilIA,
    p_usuario_id: usuarioId
  });
}

export async function guardarAnalisisIASolicitud(
  { solicitudId, compatibilidad, comentario, alerta, analisis = null },
  usuarioId
) {
  const valor = compatibilidad === "" || compatibilidad == null
    ? null
    : Number(compatibilidad);
  const valorNormalizado = Number.isFinite(valor)
    ? Math.max(0, Math.min(100, Math.round(valor)))
    : null;

  return llamarRpc("guardar_analisis_ia_solicitud", {
    p_solicitud_id: solicitudId,
    p_compatibilidad: valorNormalizado,
    p_comentario: comentario || null,
    p_alerta: Boolean(alerta),
    p_analisis: analisis,
    p_usuario_id: usuarioId
  });
}
