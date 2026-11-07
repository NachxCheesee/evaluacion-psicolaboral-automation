package cl.aquachile.evalpsi.dto.solicitud;

public record EvaluacionDto(
        String fechaEntrevista,
        String resultado,
        String observacionesEvaluador,
        String archivoTranscripcion,
        String archivoInformeFinal
) {
    public static EvaluacionDto vacia() {
        return new EvaluacionDto("", "", "", "", "");
    }
}
