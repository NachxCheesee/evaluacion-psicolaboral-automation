import { api } from "../lib/api";

// Backend (camelCase + evaluacion anidada) -> forma que usa la UI
function aSolicitud(s) {
  const ev = s.evaluacion || {};
  return {
    id: s.id,
    rut: s.rut ?? "",
    candidato: s.candidato ?? "",
    cargo: s.cargo ?? "",
    emisor: s.solicitadoPor ?? "",
    origen: "Externo",
    estado: s.estado ?? "Pendiente",
    fecha: s.fechaSolicitud ?? null,
    contacto: s.telefono ?? "",
    email: s.correo ?? "",
    direccion: s.direccion ?? "",
    observaciones: s.observaciones ?? "",
    cvArchivo: s.cvAdjunto ?? null,
    entrevistaArchivo: ev.archivoTranscripcion || null,
    informeArchivo: ev.archivoInformeFinal || null,
    resultado: ev.resultado || null,
    fechaEntrevista: ev.fechaEntrevista || null,
    observacionesEvaluador: ev.observacionesEvaluador || null
  };
}

// Forma UI -> backend request
function aBackend(s) {
  return {
    rut: s.rut || null,
    candidato: s.candidato,
    correo: s.email || null,
    telefono: s.contacto || null,
    direccion: s.direccion || null,
    cargo: s.cargo,
    familiaCargo: s.familiaCargo || null,
    fechaSolicitud: s.fecha || null,
    solicitadoPor: s.emisor || null,
    responsable: s.responsable || null,
    cvAdjunto: s.cvArchivo || null,
    estado: s.estado || null,
    observaciones: s.observaciones || null,
    evaluacion: {
      fechaEntrevista: s.fechaEntrevista || "",
      resultado: s.resultado || "",
      observacionesEvaluador: s.observacionesEvaluador || "",
      archivoTranscripcion: s.entrevistaArchivo || "",
      archivoInformeFinal: s.informeArchivo || ""
    }
  };
}

export async function listarSolicitudes() {
  const data = await api.get("/api/solicitudes?size=100");
  return (data.content || []).map(aSolicitud);
}

export async function crearSolicitud(solicitud) {
  const s = await api.post("/api/solicitudes", aBackend(solicitud));
  return aSolicitud(s);
}

export async function actualizarSolicitud(solicitud) {
  const s = await api.put(`/api/solicitudes/${solicitud.id}`, aBackend(solicitud));
  return aSolicitud(s);
}

export async function actualizarEvaluacion(id, solicitud) {
  const body = {
    estado: solicitud.estado,
    evaluacion: {
      fechaEntrevista: solicitud.fechaEntrevista || "",
      resultado: solicitud.resultado || "",
      observacionesEvaluador: solicitud.observacionesEvaluador || "",
      archivoTranscripcion: solicitud.entrevistaArchivo || "",
      archivoInformeFinal: solicitud.informeArchivo || ""
    }
  };
  const s = await api.patch(`/api/solicitudes/${id}/evaluacion`, body);
  return aSolicitud(s);
}

export async function eliminarSolicitud(id) {
  await api.del(`/api/solicitudes/${id}`);
}
