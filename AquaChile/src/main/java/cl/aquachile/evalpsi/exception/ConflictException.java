package cl.aquachile.evalpsi.exception;

/**
 * Conflicto con el estado actual (HTTP 409), por ejemplo un correo duplicado.
 */
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
