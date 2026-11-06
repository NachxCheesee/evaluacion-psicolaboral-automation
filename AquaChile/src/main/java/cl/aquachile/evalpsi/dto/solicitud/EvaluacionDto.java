package cl.aquachile.evalpsi.dto.solicitud;

/**
 * Bloque de evaluación tal como lo maneja el frontend.
 * Se guarda dentro de la columna jsonb de la solicitud.
 */
public record EvaluacionDto(
        String fechaEntrevista,
        String resultado,
        String observacionesEvaluador,
        String archivoTranscripcion,
        String archivoInformeFinal
) {
    /**
     * Evaluación vacía para solicitudes nuevas.
     */
    public static EvaluacionDto vacia() {
        return new EvaluacionDto("", "", "", "", "");
    }
}
