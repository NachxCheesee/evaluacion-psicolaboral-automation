package cl.aquachile.evalpsi.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Convierte {@link EstadoSolicitud} al texto exacto que espera la base
 * ("En proceso") y viceversa. Sin este converter, JPA guardaría "EN_PROCESO"
 * y el frontend dejaría de reconocer el estado.
 */
@Converter
public class EstadoSolicitudConverter implements AttributeConverter<EstadoSolicitud, String> {

    @Override
    public String convertToDatabaseColumn(EstadoSolicitud estado) {
        return estado == null ? null : estado.getValor();
    }

    @Override
    public EstadoSolicitud convertToEntityAttribute(String valor) {
        return valor == null ? null : EstadoSolicitud.desdeValor(valor);
    }
}
