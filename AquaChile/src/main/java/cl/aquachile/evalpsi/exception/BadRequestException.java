package cl.aquachile.evalpsi.exception;

/**
 * Solicitud inválida (HTTP 400) por reglas de negocio.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
