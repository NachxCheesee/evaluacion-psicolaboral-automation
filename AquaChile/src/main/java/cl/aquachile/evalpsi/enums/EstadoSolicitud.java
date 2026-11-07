package cl.aquachile.evalpsi.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

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
