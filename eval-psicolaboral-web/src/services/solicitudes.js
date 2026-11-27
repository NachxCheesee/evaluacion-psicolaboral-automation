import { cliente, resolver, llamarRpc } from "./conexion";

const CAMPOS = [
  "id",
  "codigo",
  "rut",
  "candidato",
  "cargo",
  "familia_cargo",
  "emisor",
  "origen",
  "estado",
  "fecha",
  "contacto",
  "email",
  "direccion",
  "observaciones",
  "cv_adjunto",
  "entrevista_archivo",
  "informe_archivo",
  "resultado",
  "fecha_entrevista",
  "observaciones_evaluador",
  "evaluacion",
  "compatibilidad_porcentaje",
  "comentario_ia_cv",
  "alerta_cv_inconsistente",
  "ia_analisis",
  "ia_actualizado_por",
  "ia_actualizado_por_nombre",
  "ia_actualizado_at"
].join(", ");

const EVALUACION_VACIA = {
  fechaEntrevista: "",
  resultado: "",
  observacionesEvaluador: "",
  archivoTranscripcion: "",
  archivoInformeFinal: ""
};

// Fila de vw_solicitudes_completas -> objeto de la UI
export function mapearSolicitud(fila) {
  if (!fila) return null;

  return {
    id: fila.id,
    codigo: fila.codigo,
    rut: fila.rut,
    candidato: fila.candidato,
    cargo: fila.cargo,
    familiaCargo: fila.familia_cargo,
    emisor: fila.emisor,
    origen: fila.origen,
    estado: fila.estado,
    fecha: fila.fecha,
    contacto: fila.contacto,
    email: fila.email,
    direccion: fila.direccion,
    observaciones: fila.observaciones,
    cvArchivo: fila.cv_adjunto,
    entrevistaArchivo: fila.entrevista_archivo,
    informeArchivo: fila.informe_archivo,
    resultado: fila.resultado,
    fechaEntrevista: fila.fecha_entrevista,
    observacionesEvaluador: fila.observaciones_evaluador,
    evaluacion: { ...EVALUACION_VACIA, ...(fila.evaluacion || {}) },
    compatibilidad: fila.compatibilidad_porcentaje,
    comentarioIA: fila.comentario_ia_cv || "",
    alertaCV: Boolean(fila.alerta_cv_inconsistente),
    iaAnalisis: fila.ia_analisis || null,
    iaActualizadoPor: fila.ia_actualizado_por,
    iaActualizadoPorNombre: fila.ia_actualizado_por_nombre || "",
    iaActualizadoAt: fila.ia_actualizado_at
  };
}

function payloadPostulacion(solicitud) {
  return {
    rut: solicitud.rut,
    candidato: solicitud.candidato,
    cargo: solicitud.cargo,
    familiaCargo: solicitud.familiaCargo ?? null,
    email: solicitud.email ?? null,
    contacto: solicitud.contacto ?? null,
    direccion: solicitud.direccion ?? null,
    observaciones: solicitud.observaciones ?? null,
    cvArchivo: solicitud.cvArchivo ?? null,
    origen: solicitud.origen ?? "Externo",
    fecha: solicitud.fecha ?? solicitud.fechaSolicitud ?? null
  };
}

function payloadActualizacion(solicitud) {
  const payload = {
    id: solicitud.id,
    rut: solicitud.rut,
    candidato: solicitud.candidato,
    cargo: solicitud.cargo,
    familiaCargo: solicitud.familiaCargo ?? null,
    email: solicitud.email ?? null,
    contacto: solicitud.contacto ?? null,
    direccion: solicitud.direccion ?? null,
    observaciones: solicitud.observaciones ?? null,
    origen: solicitud.origen ?? "Externo"
  };

  if (Object.prototype.hasOwnProperty.call(solicitud, "cvArchivo")) {
    payload.cvArchivo = solicitud.cvArchivo ?? "";
  }

  return payload;
}

export async function listarSolicitudes() {
  const filas = await resolver(
    cliente()
      .from("vw_solicitudes_completas")
      .select(CAMPOS)
      .order("fecha", { ascending: false })
      .order("id", { ascending: false })
  );
  return (filas || []).map(mapearSolicitud);
}

export async function crearSolicitud(solicitud, usuarioId = null) {
  return llamarRpc("crear_postulacion", {
    p_payload: payloadPostulacion(solicitud),
    p_usuario_id: usuarioId
  });
}

export async function actualizarSolicitud(solicitud, usuarioId = null) {
  return llamarRpc("actualizar_postulacion", {
    p_payload: payloadActualizacion(solicitud),
    p_usuario_id: usuarioId
  });
}

export async function guardarEvaluacion(solicitud, usuarioId) {
  return llamarRpc("guardar_evaluacion", {
    p_solicitud_id: solicitud.id,
    p_usuario_id: usuarioId,
    p_fecha_entrevista: solicitud.fechaEntrevista || null,
    p_resultado: solicitud.resultado || null,
    p_observaciones: solicitud.observacionesEvaluador || null,
    p_estado: solicitud.estado || null,
    p_entrevista_archivo: solicitud.entrevistaArchivo ?? "",
    p_informe_archivo: solicitud.informeArchivo ?? "",
    p_cv_archivo: solicitud.cvArchivo ?? ""
  });
}

export async function eliminarSolicitud(id, usuarioId) {
  return llamarRpc("eliminar_solicitud", {
    p_id: id,
    p_usuario_id: usuarioId
  });
}
