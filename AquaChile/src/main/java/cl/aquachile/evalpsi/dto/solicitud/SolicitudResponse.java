package cl.aquachile.evalpsi.dto.solicitud;

import java.time.LocalDate;

/**
 * Solicitud devuelta al frontend, con los mismos nombres de campo que ya usa
 * React (camelCase) para que la migración sea transparente.
 */
public record SolicitudResponse(
        Long id,
        String rut,
        String candidato,
        String correo,
        String telefono,
        String direccion,
        String cargo,
        String familiaCargo,
        LocalDate fechaSolicitud,
        String solicitadoPor,
        String responsable,
        String cvAdjunto,
        String estado,
        String observaciones,
        EvaluacionDto evaluacion
) {
}
