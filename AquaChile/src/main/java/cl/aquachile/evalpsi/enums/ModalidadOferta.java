package cl.aquachile.evalpsi.enums;

import cl.aquachile.evalpsi.exception.BadRequestException;

public enum ModalidadOferta {
    PRESENCIAL,
    HIBRIDA,
    REMOTA;

    public static ModalidadOferta desdeValor(String valor) {
        if (valor == null || valor.isBlank()) {
            return PRESENCIAL;
        }
        try {
            return valueOf(valor.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Modalidad inválida. Usa PRESENCIAL, HIBRIDA o REMOTA.");
        }
    }

    public String getValor() {
        return name();
    }
}
