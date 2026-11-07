package cl.aquachile.evalpsi.dto.solicitud;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SolicitudRequest(
        String rut,

        @NotBlank(message = "El nombre del candidato es obligatorio")
        @Size(max = 150, message = "El nombre del candidato es demasiado largo")
        String candidato,

        @Email(message = "El correo no tiene un formato válido")
        String correo,

        String telefono,
        String direccion,

        @NotBlank(message = "El cargo es obligatorio")
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
