package cl.aquachile.evalpsi.dto.usuario;

import java.time.LocalDate;

import cl.aquachile.evalpsi.enums.Rol;

public record UsuarioResponse(
        Long id,
        String correo,
        String nombre,
        Rol rol,
        String tituloRol,
        LocalDate fechaAlta
) {
}
