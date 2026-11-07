package cl.aquachile.evalpsi.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
