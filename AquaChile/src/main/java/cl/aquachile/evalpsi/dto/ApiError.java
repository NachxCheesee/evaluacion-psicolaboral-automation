package cl.aquachile.evalpsi.dto;

import java.time.Instant;
import java.util.Map;

/**
 * Formato único de error para toda la API.
 * Evita que el frontend reciba estructuras distintas según el fallo.
 */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> detalles
) {
    public ApiError(int status, String error, String message, String path) {
        this(Instant.now(), status, error, message, path, null);
    }

    public ApiError(int status, String error, String message, String path, Map<String, String> detalles) {
        this(Instant.now(), status, error, message, path, detalles);
    }
}
