package cl.aquachile.evalpsi.dto.oferta;

import java.time.Instant;
import java.time.LocalDate;

public record OfertaResponse(
        Long id,
        String cargo,
        String categoria,
        String ubicacion,
        String modalidad,
        LocalDate fechaPublicacion,
        Integer cupos,
        String descripcion,
        String funciones,
        String requisitos,
        String beneficios,
        String sueldo,
        boolean publicada,
        Long responsableId,
        String responsableNombre,
        Instant createdAt,
        Instant updatedAt
) {
}
