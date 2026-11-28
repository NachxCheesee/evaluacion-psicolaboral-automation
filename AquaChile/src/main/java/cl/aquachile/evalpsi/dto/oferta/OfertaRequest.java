package cl.aquachile.evalpsi.dto.oferta;

import java.time.LocalDate;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record OfertaRequest(
        @NotBlank(message = "El cargo es obligatorio")
        @Size(max = 160, message = "El cargo es demasiado largo")
        String cargo,

        @NotBlank(message = "La categoría es obligatoria")
        @Size(max = 160, message = "La categoría es demasiado larga")
        String categoria,

        @NotBlank(message = "La ubicación es obligatoria")
        @Size(max = 200, message = "La ubicación es demasiado larga")
        String ubicacion,

        @NotBlank(message = "La modalidad es obligatoria")
        String modalidad,

        LocalDate fechaPublicacion,

        @NotNull(message = "Los cupos son obligatorios")
        @Min(value = 0, message = "Los cupos no pueden ser negativos")
        Integer cupos,

        String descripcion,
        String funciones,
        String requisitos,
        String beneficios,
        String sueldo,
        Boolean publicada,
        Long responsableId
) {
}
