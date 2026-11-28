package cl.aquachile.evalpsi.mapper;

import cl.aquachile.evalpsi.dto.postulacion.PostulacionResponse;
import cl.aquachile.evalpsi.model.Oferta;
import cl.aquachile.evalpsi.model.Postulacion;
import cl.aquachile.evalpsi.model.Postulante;
import cl.aquachile.evalpsi.model.Solicitud;

public final class PostulacionMapper {

    private PostulacionMapper() {
    }

    public static PostulacionResponse toResponse(Postulacion postulacion) {
        if (postulacion == null) {
            return null;
        }
        Oferta oferta = postulacion.getOferta();
        Postulante postulante = postulacion.getPostulante();
        Solicitud solicitud = postulacion.getSolicitud();

        return new PostulacionResponse(
                postulacion.getId(),
                oferta == null ? null : oferta.getId(),
                oferta == null ? null : oferta.getCargo(),
                postulante == null ? null : postulante.getId(),
                postulante == null ? null : postulante.getNombre(),
                postulante == null ? null : postulante.getRut(),
                solicitud == null ? null : solicitud.getId(),
                postulacion.getCvDriveFileId(),
                postulacion.getCvNombre(),
                postulacion.getEstado() == null ? null : postulacion.getEstado().getValor(),
                postulacion.getObservaciones(),
                postulacion.getCreatedAt(),
                postulacion.getUpdatedAt()
        );
    }
}
