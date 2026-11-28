package cl.aquachile.evalpsi.mapper;

import java.time.LocalDate;

import cl.aquachile.evalpsi.dto.oferta.OfertaRequest;
import cl.aquachile.evalpsi.dto.oferta.OfertaResponse;
import cl.aquachile.evalpsi.enums.ModalidadOferta;
import cl.aquachile.evalpsi.model.Cuenta;
import cl.aquachile.evalpsi.model.Oferta;

public final class OfertaMapper {

    private OfertaMapper() {
    }

    public static Oferta toEntity(OfertaRequest request, Cuenta responsable) {
        return Oferta.builder()
                .cargo(request.cargo().trim())
                .categoria(request.categoria().trim())
                .ubicacion(request.ubicacion().trim())
                .modalidad(ModalidadOferta.desdeValor(request.modalidad()))
                .fechaPublicacion(request.fechaPublicacion() != null
                        ? request.fechaPublicacion()
                        : LocalDate.now())
                .cupos(request.cupos())
                .descripcion(normalizar(request.descripcion()))
                .funciones(normalizar(request.funciones()))
                .requisitos(normalizar(request.requisitos()))
                .beneficios(normalizar(request.beneficios()))
                .sueldo(normalizar(request.sueldo()))
                .publicada(Boolean.TRUE.equals(request.publicada()))
                .responsable(responsable)
                .build();
    }

    public static void aplicar(Oferta oferta, OfertaRequest request, Cuenta responsable) {
        oferta.setCargo(request.cargo().trim());
        oferta.setCategoria(request.categoria().trim());
        oferta.setUbicacion(request.ubicacion().trim());
        oferta.setModalidad(ModalidadOferta.desdeValor(request.modalidad()));
        if (request.fechaPublicacion() != null) {
            oferta.setFechaPublicacion(request.fechaPublicacion());
        }
        if (request.cupos() != null) {
            oferta.setCupos(request.cupos());
        }
        oferta.setDescripcion(normalizar(request.descripcion()));
        oferta.setFunciones(normalizar(request.funciones()));
        oferta.setRequisitos(normalizar(request.requisitos()));
        oferta.setBeneficios(normalizar(request.beneficios()));
        oferta.setSueldo(normalizar(request.sueldo()));
        if (request.publicada() != null) {
            oferta.setPublicada(request.publicada());
        }
        oferta.setResponsable(responsable);
    }

    public static OfertaResponse toResponse(Oferta oferta) {
        if (oferta == null) {
            return null;
        }
        Cuenta responsable = oferta.getResponsable();
        return new OfertaResponse(
                oferta.getId(),
                oferta.getCargo(),
                oferta.getCategoria(),
                oferta.getUbicacion(),
                oferta.getModalidad() == null ? null : oferta.getModalidad().getValor(),
                oferta.getFechaPublicacion(),
                oferta.getCupos(),
                oferta.getDescripcion(),
                oferta.getFunciones(),
                oferta.getRequisitos(),
                oferta.getBeneficios(),
                oferta.getSueldo(),
                oferta.isPublicada(),
                responsable == null ? null : responsable.getId(),
                responsable == null ? null : responsable.getNombre(),
                oferta.getCreatedAt(),
                oferta.getUpdatedAt()
        );
    }

    private static String normalizar(String valor) {
        return valor == null ? null : valor.trim();
    }
}
