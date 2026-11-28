package cl.aquachile.evalpsi.dto.postulacion;

import java.time.Instant;

public record PostulacionResponse(
        Long id,
        Long ofertaId,
        String ofertaCargo,
        Long postulanteId,
        String postulanteNombre,
        String postulanteRut,
        Long solicitudId,
        String cvDriveFileId,
        String cvNombre,
        String estado,
        String observaciones,
        Instant createdAt,
        Instant updatedAt
) {
}
