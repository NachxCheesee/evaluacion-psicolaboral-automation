package cl.aquachile.evalpsi.dto.postulacion;

import jakarta.validation.constraints.NotBlank;

public record ActualizarEstadoPostulacionRequest(
        @NotBlank(message = "El estado es obligatorio")
        String estado
) {
}
