import { cliente, resolver } from "./conexion";

const CAMPOS =
  "id, rut, candidato, correo, telefono, direccion, cargo, familia_cargo, " +
  "fecha_solicitud, solicitado_por, responsable, cv_adjunto, estado, observaciones, evaluacion";

const EVALUACION_VACIA = {
  fechaEntrevista: "",
  resultado: "",
  observacionesEvaluador: "",
  archivoTranscripcion: "",
  archivoInformeFinal: ""
};

// Fila (snake_case) -> objeto de la UI (camelCase)
export function mapearSolicitud(fila) {
  if (!fila) return null;
  return {
    id: fila.id,
    rut: fila.rut,
    candidato: fila.candidato,
    correo: fila.correo,
    telefono: fila.telefono,
    direccion: fila.direccion,
    cargo: fila.cargo,
    familiaCargo: fila.familia_cargo,
    fechaSolicitud: fila.fecha_solicitud,
    solicitadoPor: fila.solicitado_por,
    responsable: fila.responsable,
    cvAdjunto: fila.cv_adjunto,
    estado: fila.estado,
    observaciones: fila.observaciones,
    evaluacion: { ...EVALUACION_VACIA, ...(fila.evaluacion || {}) }
  };
}

// Objeto de la UI (camelCase) -> fila (snake_case); el id lo asigna la BD.
// Los campos con valor por defecto en la BD se omiten si no vienen,
// para que Postgres aplique el default en vez de recibir un null.
function aFila(solicitud) {
  const fila = {
    rut: solicitud.rut ?? null,
    candidato: solicitud.candidato,
    correo: solicitud.correo ?? null,
    telefono: solicitud.telefono ?? null,
    direccion: solicitud.direccion ?? null,
    cargo: solicitud.cargo,
    familia_cargo: solicitud.familiaCargo ?? null,
    solicitado_por: solicitud.solicitadoPor ?? null,
    responsable: solicitud.responsable ?? null,
    cv_adjunto: solicitud.cvAdjunto ?? null,
    estado: solicitud.estado ?? "Pendiente",
    observaciones: solicitud.observaciones ?? null
  };
  if (solicitud.fechaSolicitud) fila.fecha_solicitud = solicitud.fechaSolicitud;
  if (solicitud.evaluacion) fila.evaluacion = solicitud.evaluacion;
  return fila;
}

export async function listarSolicitudes() {
  const filas = await resolver(
    cliente().from("solicitudes").select(CAMPOS).order("id", { ascending: true })
  );
  return (filas || []).map(mapearSolicitud);
}

export async function crearSolicitud(solicitud) {
  const fila = await resolver(
    cliente().from("solicitudes").insert(aFila(solicitud)).select(CAMPOS).single()
  );
  return mapearSolicitud(fila);
}

export async function actualizarSolicitud(solicitud) {
  const fila = await resolver(
    cliente()
      .from("solicitudes")
      .update(aFila(solicitud))
      .eq("id", solicitud.id)
      .select(CAMPOS)
      .single()
  );
  return mapearSolicitud(fila);
}

export async function actualizarEvaluacion(id, datosEvaluacion) {
  const fila = await resolver(
    cliente()
      .from("solicitudes")
      .update({
        estado: datosEvaluacion.estado,
        evaluacion: datosEvaluacion.evaluacion
      })
      .eq("id", id)
      .select(CAMPOS)
      .single()
  );
  return mapearSolicitud(fila);
}

export async function eliminarSolicitud(id) {
  await resolver(cliente().from("solicitudes").delete().eq("id", id));
}
