package cl.aquachile.evalpsi.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Evaluación anidada dentro de una solicitud.
 *
 * <p>No es una entidad ni una tabla: se guarda como un objeto JSON dentro de
 * {@code solicitudes.evaluacion}. Los nombres de los campos deben coincidir
 * exactamente con los que usa el frontend React.</p>
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evaluacion {

    private String fechaEntrevista;
    private String resultado;
    private String observacionesEvaluador;
    private String archivoTranscripcion;
    private String archivoInformeFinal;

    /**
     * Evaluación vacía que se asigna por defecto a las solicitudes nuevas.
     */
    public static Evaluacion vacia() {
        return Evaluacion.builder()
                .fechaEntrevista("")
                .resultado("")
                .observacionesEvaluador("")
                .archivoTranscripcion("")
                .archivoInformeFinal("")
                .build();
    }
}
