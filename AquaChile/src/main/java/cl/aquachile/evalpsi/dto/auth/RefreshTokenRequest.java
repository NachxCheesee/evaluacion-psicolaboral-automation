package cl.aquachile.evalpsi.dto.auth;

import jakarta.validation.constraints.NotBlank;

/**
 * Token usado para renovar la sesión o cerrarla.
 */
public record RefreshTokenRequest(
        @NotBlank(message = "El refresh token es obligatorio")
        String refreshToken
) {
}
