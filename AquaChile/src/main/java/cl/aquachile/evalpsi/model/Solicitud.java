package cl.aquachile.evalpsi.model;

import java.time.LocalDate;

import cl.aquachile.evalpsi.enums.EstadoSolicitud;
import cl.aquachile.evalpsi.enums.EstadoSolicitudConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "solicitudes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "text")
    private String rut;

    @Column(nullable = false, columnDefinition = "text")
    private String candidato;

    @Column(columnDefinition = "text")
    private String correo;

    @Column(columnDefinition = "text")
    private String telefono;

    @Column(columnDefinition = "text")
    private String direccion;

    @Column(nullable = false, columnDefinition = "text")
    private String cargo;

    @Column(name = "familia_cargo", columnDefinition = "text")
    private String familiaCargo;

    @Column(name = "fecha_solicitud", nullable = false)
    private LocalDate fechaSolicitud;

    @Column(name = "solicitado_por", columnDefinition = "text")
    private String solicitadoPor;

    @Column(columnDefinition = "text")
    private String responsable;

    @Column(name = "cv_adjunto", columnDefinition = "text")
    private String cvAdjunto;

    @Convert(converter = EstadoSolicitudConverter.class)
    @Column(nullable = false, columnDefinition = "text")
    private EstadoSolicitud estado;

    @Column(columnDefinition = "text")
    private String observaciones;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private Evaluacion evaluacion;
}
