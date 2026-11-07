package cl.aquachile.evalpsi.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ResultadoEvaluacion {

    EN_EVALUACION("En evaluación"),
    RECOMENDABLE("Recomendable"),
    RECOMENDABLE_CON_OBSERVACIONES("Recomendable con observaciones"),
    NO_RECOMENDABLE("No recomendable"),
    SIN_RESULTADO("");

    private final String valor;

    ResultadoEvaluacion(String valor) {
        this.valor = valor;
    }

    @JsonValue
    public String getValor() {
        return valor;
    }

    @JsonCreator
    public static ResultadoEvaluacion desdeValor(String valor) {
        if (valor == null || valor.isBlank()) {
            return SIN_RESULTADO;
        }
        for (ResultadoEvaluacion resultado : values()) {
            if (resultado.valor.equalsIgnoreCase(valor.trim()) || resultado.name().equalsIgnoreCase(valor.trim())) {
                return resultado;
            }
        }
        throw new IllegalArgumentException("Resultado no válido: " + valor);
    }
}
