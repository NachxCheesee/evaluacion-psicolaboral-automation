package cl.aquachile.evalpsi.exception;

/**
 * Credenciales inválidas o token vencido/revocado (HTTP 401).
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
