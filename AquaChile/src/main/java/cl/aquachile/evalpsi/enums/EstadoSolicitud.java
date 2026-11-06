package cl.aquachile.evalpsi.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Estados del proceso de evaluación.
 *
 * <p>En la base de datos se guardan los textos en español con espacios
 * ("Pendiente", "En proceso", "Finalizada"), tal como los usa el frontend.
 * Por eso el enum mantiene su propia etiqueta y se convierte con
 * {@link EstadoSolicitudConverter}.</p>
 */
public enum EstadoSolicitud {

    PENDIENTE("Pendiente"),
    EN_PROCESO("En proceso"),
    FINALIZADA("Finalizada");

    private final String valor;

    EstadoSolicitud(String valor) {
        this.valor = valor;
    }

    @JsonValue
    public String getValor() {
        return valor;
    }

    /**
     * Convierte el texto que viene de la API/BD al enum correspondiente.
     *
     * @throws IllegalArgumentException si el texto no es un estado válido
     */
    @JsonCreator
    public static EstadoSolicitud desdeValor(String valor) {
        if (valor == null) {
            return null;
        }
        for (EstadoSolicitud estado : values()) {
            if (estado.valor.equalsIgnoreCase(valor.trim()) || estado.name().equalsIgnoreCase(valor.trim())) {
                return estado;
            }
        }
        throw new IllegalArgumentException("Estado no válido: " + valor);
    }
}
