package cl.aquachile.evalpsi.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import cl.aquachile.evalpsi.config.JwtProperties;
import cl.aquachile.evalpsi.model.Cuenta;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Genera y valida los access tokens JWT.
 *
 * <p>El token incluye el id, correo, nombre y rol de la cuenta. Con eso el
 * filtro puede autenticar cada petición sin consultar la base en cada request.</p>
 */
@Service
public class JwtService {

    private final SecretKey clave;
    private final JwtProperties properties;

    public JwtService(JwtProperties properties) {
        this.properties = properties;

        String secret = properties.secret();
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET debe tener al menos 32 caracteres. Revisa tu archivo .env"
            );
        }
        // HS256 requiere una clave de al menos 256 bits.
        this.clave = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generarAccessToken(Cuenta cuenta) {
        Instant ahora = Instant.now();
        Instant expiracion = ahora.plus(properties.accessTokenMinutes(), ChronoUnit.MINUTES);

        return Jwts.builder()
                .subject(cuenta.getCorreo())
                .claim("uid", cuenta.getId())
                .claim("nombre", cuenta.getNombre())
                .claim("rol", cuenta.getRol().name())
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(expiracion))
                .signWith(clave)
                .compact();
    }

    /**
     * Valida la firma y la expiración. Lanza {@link io.jsonwebtoken.JwtException}
     * si el token es inválido.
     */
    public Claims parsear(String token) {
        return Jwts.parser()
                .verifyWith(clave)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long getExpiresInSeconds() {
        return properties.accessTokenMinutes() * 60;
    }
}
