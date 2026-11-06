package cl.aquachile.evalpsi.dto.solicitud;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Datos para crear o editar una solicitud de evaluación.
 *
 * <p>Los campos obligatorios replican las validaciones que hoy hace el
 * formulario React (RUT, candidato, correo y cargo).</p>
 */
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

        /** Texto del estado ("Pendiente", "En proceso", "Finalizada"). */
        String estado,

        String observaciones,

        /** Si no viene, se crea una evaluación vacía. */
        EvaluacionDto evaluacion
) {
}
