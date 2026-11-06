package cl.aquachile.evalpsi.model;

import java.time.LocalDate;

import cl.aquachile.evalpsi.enums.Rol;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Cuenta institucional que puede iniciar sesión en el sistema.
 *
 * <p>Importante: esta entidad NUNCA se devuelve directamente en un endpoint.
 * Siempre se transforma a un DTO sin contraseña.</p>
 */
@Entity
@Table(name = "cuentas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cuenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, columnDefinition = "text")
    private String correo;

    /**
     * Contraseña en texto plano que todavía escribe el frontend actual.
     * Se conserva de forma temporal para no romper la aplicación mientras
     * se migra al backend. No se expone en ninguna respuesta.
     */
    @Column(name = "password", columnDefinition = "text")
    private String password;

    /**
     * Hash BCrypt de la contraseña. Es el valor que usa el backend para
     * autenticar. Puede ser null en cuentas creadas por el frontend antiguo;
     * en ese caso se migra automáticamente en el primer login exitoso.
     */
    @Column(name = "password_hash", columnDefinition = "text")
    private String passwordHash;

    @Column(nullable = false, columnDefinition = "text")
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "text")
    private Rol rol;

    @Column(name = "titulo_rol", columnDefinition = "text")
    private String tituloRol;

    @Column(name = "fecha_alta")
    private LocalDate fechaAlta;
}
