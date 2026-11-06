package cl.aquachile.evalpsi.mapper;

import cl.aquachile.evalpsi.dto.usuario.UsuarioResponse;
import cl.aquachile.evalpsi.model.Cuenta;

/**
 * Transforma entidades Cuenta a DTOs seguros (sin contraseña).
 */
public final class CuentaMapper {

    private CuentaMapper() {
    }

    public static UsuarioResponse toResponse(Cuenta cuenta) {
        return new UsuarioResponse(
                cuenta.getId(),
                cuenta.getCorreo(),
                cuenta.getNombre(),
                cuenta.getRol(),
                cuenta.getTituloRol(),
                cuenta.getFechaAlta()
        );
    }
}
