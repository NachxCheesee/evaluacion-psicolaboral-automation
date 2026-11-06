package cl.aquachile.evalpsi.mapper;

import java.time.LocalDate;

import cl.aquachile.evalpsi.dto.solicitud.EvaluacionDto;
import cl.aquachile.evalpsi.dto.solicitud.SolicitudRequest;
import cl.aquachile.evalpsi.dto.solicitud.SolicitudResponse;
import cl.aquachile.evalpsi.enums.EstadoSolicitud;
import cl.aquachile.evalpsi.exception.BadRequestException;
import cl.aquachile.evalpsi.model.Evaluacion;
import cl.aquachile.evalpsi.model.Solicitud;

/**
 * Conversiones entre la entidad Solicitud y los DTOs de la API.
 */
public final class SolicitudMapper {

    private SolicitudMapper() {
    }

    public static Solicitud toEntity(SolicitudRequest request) {
        return Solicitud.builder()
                .rut(normalizar(request.rut()))
                .candidato(request.candidato().trim())
                .correo(normalizar(request.correo()))
                .telefono(normalizar(request.telefono()))
                .direccion(normalizar(request.direccion()))
                .cargo(request.cargo().trim())
                .familiaCargo(normalizar(request.familiaCargo()))
                .fechaSolicitud(request.fechaSolicitud() != null ? request.fechaSolicitud() : LocalDate.now())
                .solicitadoPor(normalizar(request.solicitadoPor()))
                .responsable(normalizar(request.responsable()))
                .cvAdjunto(normalizar(request.cvAdjunto()))
                .estado(parseEstado(request.estado(), EstadoSolicitud.PENDIENTE))
                .observaciones(normalizar(request.observaciones()))
                .evaluacion(toEvaluacion(request.evaluacion()))
                .build();
    }

    /**
     * Aplica los cambios de un PUT sobre una entidad existente.
     * Los campos opcionales que llegan null se conservan; para borrar un
     * valor se debe enviar una cadena vacía.
     */
    public static void aplicar(Solicitud solicitud, SolicitudRequest request) {
        if (request.rut() != null) {
            solicitud.setRut(normalizar(request.rut()));
        }
        solicitud.setCandidato(request.candidato().trim());
        if (request.correo() != null) {
            solicitud.setCorreo(normalizar(request.correo()));
        }
        if (request.telefono() != null) {
            solicitud.setTelefono(normalizar(request.telefono()));
        }
        if (request.direccion() != null) {
            solicitud.setDireccion(normalizar(request.direccion()));
        }
        solicitud.setCargo(request.cargo().trim());
        if (request.familiaCargo() != null) {
            solicitud.setFamiliaCargo(normalizar(request.familiaCargo()));
        }

        if (request.fechaSolicitud() != null) {
            solicitud.setFechaSolicitud(request.fechaSolicitud());
        }
        if (request.solicitadoPor() != null) {
            solicitud.setSolicitadoPor(normalizar(request.solicitadoPor()));
        }
        if (request.responsable() != null) {
            solicitud.setResponsable(normalizar(request.responsable()));
        }
        if (request.cvAdjunto() != null) {
            solicitud.setCvAdjunto(normalizar(request.cvAdjunto()));
        }
        if (request.observaciones() != null) {
            solicitud.setObservaciones(normalizar(request.observaciones()));
        }

        if (request.estado() != null && !request.estado().isBlank()) {
            solicitud.setEstado(parseEstado(request.estado(), solicitud.getEstado()));
        }
        if (request.evaluacion() != null) {
            solicitud.setEvaluacion(toEvaluacion(request.evaluacion()));
        }
    }

    public static SolicitudResponse toResponse(Solicitud solicitud) {
        return new SolicitudResponse(
                solicitud.getId(),
                solicitud.getRut(),
                solicitud.getCandidato(),
                solicitud.getCorreo(),
                solicitud.getTelefono(),
                solicitud.getDireccion(),
                solicitud.getCargo(),
                solicitud.getFamiliaCargo(),
                solicitud.getFechaSolicitud(),
                solicitud.getSolicitadoPor(),
                solicitud.getResponsable(),
                solicitud.getCvAdjunto(),
                solicitud.getEstado().getValor(),
                solicitud.getObservaciones(),
                toDto(solicitud.getEvaluacion())
        );
    }

    public static Evaluacion toEvaluacion(EvaluacionDto dto) {
        if (dto == null) {
            return Evaluacion.vacia();
        }
        return Evaluacion.builder()
                .fechaEntrevista(texto(dto.fechaEntrevista()))
                .resultado(texto(dto.resultado()))
                .observacionesEvaluador(texto(dto.observacionesEvaluador()))
                .archivoTranscripcion(texto(dto.archivoTranscripcion()))
                .archivoInformeFinal(texto(dto.archivoInformeFinal()))
                .build();
    }

    public static EvaluacionDto toDto(Evaluacion evaluacion) {
        if (evaluacion == null) {
            return EvaluacionDto.vacia();
        }
        return new EvaluacionDto(
                texto(evaluacion.getFechaEntrevista()),
                texto(evaluacion.getResultado()),
                texto(evaluacion.getObservacionesEvaluador()),
                texto(evaluacion.getArchivoTranscripcion()),
                texto(evaluacion.getArchivoInformeFinal())
        );
    }

    /**
     * Mezcla una evaluación recibida con la existente. Los campos que llegan
     * null se conservan, para no borrar información si el cliente envía un
     * objeto parcial.
     */
    public static Evaluacion mezclar(Evaluacion actual, EvaluacionDto dto) {
        Evaluacion base = actual != null ? actual : Evaluacion.vacia();

        if (dto == null) {
            return base;
        }
        if (dto.fechaEntrevista() != null) {
            base.setFechaEntrevista(dto.fechaEntrevista());
        }
        if (dto.resultado() != null) {
            base.setResultado(dto.resultado());
        }
        if (dto.observacionesEvaluador() != null) {
            base.setObservacionesEvaluador(dto.observacionesEvaluador());
        }
        if (dto.archivoTranscripcion() != null) {
            base.setArchivoTranscripcion(dto.archivoTranscripcion());
        }
        if (dto.archivoInformeFinal() != null) {
            base.setArchivoInformeFinal(dto.archivoInformeFinal());
        }
        return base;
    }

    /**
     * Convierte el estado recibido como texto al enum, con mensaje claro
     * si el frontend envía un valor desconocido.
     */
    public static EstadoSolicitud parseEstado(String valor, EstadoSolicitud porDefecto) {
        if (valor == null || valor.isBlank()) {
            return porDefecto;
        }
        try {
            return EstadoSolicitud.desdeValor(valor);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(ex.getMessage());
        }
    }

    private static String normalizar(String valor) {
        return valor == null ? null : valor.trim();
    }

    private static String texto(String valor) {
        return valor == null ? "" : valor;
    }
}
