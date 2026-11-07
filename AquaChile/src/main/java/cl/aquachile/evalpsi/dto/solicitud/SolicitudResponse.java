package cl.aquachile.evalpsi.dto.solicitud;

import java.time.LocalDate;

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
