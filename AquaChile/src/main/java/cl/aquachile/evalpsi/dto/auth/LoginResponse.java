package cl.aquachile.evalpsi.dto.auth;

import cl.aquachile.evalpsi.dto.usuario.UsuarioResponse;

/**
 * Respuesta del login y del refresh.
 *
 * <p>El frontend debe guardar ambos tokens: el access para llamar a la API
 * y el refresh para renovarlo sin pedir la contraseña otra vez.</p>
 */
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
