package cl.aquachile.evalpsi.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

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
