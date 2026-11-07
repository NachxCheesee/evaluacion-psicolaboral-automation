package cl.aquachile.evalpsi.dto.solicitud;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ActualizarEvaluacionRequest(
        @NotBlank(message = "El estado es obligatorio")
        String estado,

        @NotNull(message = "La evaluación es obligatoria")
        EvaluacionDto evaluacion
) {
}
