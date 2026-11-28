package cl.aquachile.evalpsi.dto.postulacion;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PostulacionRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 180, message = "El nombre es demasiado largo")
        String nombre,

        @NotBlank(message = "El RUT es obligatorio")
        @Size(max = 20, message = "El RUT es demasiado largo")
        String rut,

        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "El correo no tiene un formato válido")
        String correo,

        @NotBlank(message = "El teléfono es obligatorio")
        @Size(max = 30, message = "El teléfono es demasiado largo")
        String telefono,

        String observaciones
) {
}
