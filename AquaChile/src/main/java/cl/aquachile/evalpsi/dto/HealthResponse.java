package cl.aquachile.evalpsi.dto;

import java.time.Instant;

/**
 * Respuesta del endpoint de salud del microservicio.
 */
public record HealthResponse(
        String status,
        String service,
        String version,
        Instant timestamp
) {
}
