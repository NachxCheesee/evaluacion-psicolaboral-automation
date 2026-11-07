package cl.aquachile.evalpsi.dto.auth;

import cl.aquachile.evalpsi.dto.usuario.UsuarioResponse;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        UsuarioResponse usuario
) {
    public static LoginResponse bearer(String accessToken,
                                       String refreshToken,
                                       long expiresIn,
                                       UsuarioResponse usuario) {
        return new LoginResponse(accessToken, refreshToken, "Bearer", expiresIn, usuario);
    }
}
