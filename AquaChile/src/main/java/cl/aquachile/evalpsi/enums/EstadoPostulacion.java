package cl.aquachile.evalpsi.enums;

import cl.aquachile.evalpsi.exception.BadRequestException;

public enum EstadoPostulacion {
    RECIBIDA,
    EN_REVISION,
    RECHAZADA,
    CONTRATADA;

    public static EstadoPostulacion desdeValor(String valor) {
        if (valor == null || valor.isBlank()) {
            return RECIBIDA;
        }
        try {
            return valueOf(valor.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(
                    "Estado de postulación inválido. Usa RECIBIDA, EN_REVISION, RECHAZADA o CONTRATADA.");
        }
    }

    public String getValor() {
        return name();
    }
}
