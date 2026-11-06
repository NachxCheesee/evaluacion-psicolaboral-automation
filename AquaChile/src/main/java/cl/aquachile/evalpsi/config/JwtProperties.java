package cl.aquachile.evalpsi.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Propiedades del JWT, enlazadas desde application.yml / variables de entorno.
 *
 * @param secret             clave HMAC (mínimo 32 caracteres)
 * @param accessTokenMinutes vigencia del access token
 * @param refreshTokenDays   vigencia del refresh token
 */
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(
        String secret,
        long accessTokenMinutes,
        long refreshTokenDays
) {
}
