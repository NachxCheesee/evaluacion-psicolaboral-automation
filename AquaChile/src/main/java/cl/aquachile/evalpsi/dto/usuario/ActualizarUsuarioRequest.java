package cl.aquachile.evalpsi.dto.usuario;

import cl.aquachile.evalpsi.enums.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Datos para editar una cuenta. La contraseña es opcional: si viene vacía,
 * se conserva la actual.
 */
public record ActualizarUsuarioRequest(
        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        String correo,

        String password,

        @NotBlank(message = "El nombre es obligatorio")
        String nombre,

        @NotNull(message = "El rol es obligatorio")
        Rol rol,

        String tituloRol
) {
}
