package cl.aquachile.evalpsi.service;

import java.io.IOException;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import cl.aquachile.evalpsi.dto.postulacion.ActualizarEstadoPostulacionRequest;
import cl.aquachile.evalpsi.dto.postulacion.PostulacionRequest;
import cl.aquachile.evalpsi.dto.postulacion.PostulacionResponse;
import cl.aquachile.evalpsi.enums.EstadoPostulacion;
import cl.aquachile.evalpsi.exception.BadRequestException;
import cl.aquachile.evalpsi.exception.ConflictException;
import cl.aquachile.evalpsi.exception.NotFoundException;
import cl.aquachile.evalpsi.mapper.PostulacionMapper;
import cl.aquachile.evalpsi.model.Oferta;
import cl.aquachile.evalpsi.model.Postulacion;
import cl.aquachile.evalpsi.model.Postulante;
import cl.aquachile.evalpsi.model.Solicitud;
import cl.aquachile.evalpsi.repository.OfertaRepository;
import cl.aquachile.evalpsi.repository.PostulacionRepository;
import cl.aquachile.evalpsi.repository.PostulanteRepository;

@Service
public class PostulacionService {

    private final PostulacionRepository postulacionRepository;
    private final PostulanteRepository postulanteRepository;
    private final OfertaRepository ofertaRepository;
    private final SolicitudService solicitudService;
    private final GoogleDriveService googleDriveService;
    private final CvValidator cvValidator;

    public PostulacionService(PostulacionRepository postulacionRepository,
                              PostulanteRepository postulanteRepository,
                              OfertaRepository ofertaRepository,
                              SolicitudService solicitudService,
                              GoogleDriveService googleDriveService,
                              CvValidator cvValidator) {
        this.postulacionRepository = postulacionRepository;
        this.postulanteRepository = postulanteRepository;
        this.ofertaRepository = ofertaRepository;
        this.solicitudService = solicitudService;
        this.googleDriveService = googleDriveService;
        this.cvValidator = cvValidator;
    }

    @Transactional
    public PostulacionResponse postular(Long ofertaId, PostulacionRequest request, MultipartFile cv) {
        Oferta oferta = ofertaRepository.findById(ofertaId)
                .orElseThrow(() -> new NotFoundException("No existe la oferta con id " + ofertaId));

        if (!oferta.isPublicada()) {
            throw new BadRequestException("La oferta no está publicada.");
        }

        long inscritos = postulacionRepository.countByOfertaId(ofertaId);
        if (oferta.getCupos() != null && inscritos >= oferta.getCupos()) {
            throw new BadRequestException("La oferta no tiene cupos disponibles.");
        }

        String rut = normalizarRut(request.rut());
        Postulante postulante = postulanteRepository.findByRut(rut)
                .orElseGet(() -> Postulante.builder().rut(rut).build());
        postulante.setNombre(request.nombre().trim());
        postulante.setCorreo(normalizar(request.correo()));
        postulante.setTelefono(normalizar(request.telefono()));
        postulante = postulanteRepository.save(postulante);

        if (postulacionRepository.existsByOfertaIdAndPostulanteId(ofertaId, postulante.getId())) {
            throw new ConflictException("Ya existe una postulación de este RUT para la oferta.");
        }

        cvValidator.validar(cv);
        byte[] contenido;
        try {
            contenido = cv.getBytes();
        } catch (IOException ex) {
            throw new BadRequestException("No se pudo leer el archivo del CV.");
        }

        String nombreCv = cvValidator.nombreArchivo(cv);
        String contentType = cv.getContentType() != null
                ? cv.getContentType()
                : "application/octet-stream";

        String raizId = googleDriveService.obtenerOCrearCarpetaRaiz();
        String carpetaId = googleDriveService.obtenerOCrearCarpetaCandidato(
                raizId, postulante.getNombre(), rut);
        String fileId = googleDriveService.subir(carpetaId, nombreCv, contentType, contenido);

        try {
            String observaciones = normalizar(request.observaciones());
            if (observaciones == null) {
                observaciones = "Postulación a la oferta " + oferta.getId() + " - " + oferta.getCargo();
            }

            Solicitud solicitud = solicitudService.crearDesdePostulacion(
                    postulante, oferta, nombreCv, fileId, observaciones);

            Postulacion postulacion = Postulacion.builder()
                    .oferta(oferta)
                    .postulante(postulante)
                    .solicitud(solicitud)
                    .cvDriveFileId(fileId)
                    .cvNombre(nombreCv)
                    .estado(EstadoPostulacion.RECIBIDA)
                    .observaciones(observaciones)
                    .build();

            return PostulacionMapper.toResponse(postulacionRepository.save(postulacion));
        } catch (RuntimeException ex) {
            googleDriveService.borrar(fileId);
            throw ex;
        }
    }

    @Transactional(readOnly = true)
    public List<PostulacionResponse> listarPorOferta(Long ofertaId) {
        if (!ofertaRepository.existsById(ofertaId)) {
            throw new NotFoundException("No existe la oferta con id " + ofertaId);
        }
        return postulacionRepository.findByOfertaIdOrderByCreatedAtDesc(ofertaId)
                .stream()
                .map(PostulacionMapper::toResponse)
                .toList();
    }

    @Transactional
    public PostulacionResponse actualizarEstado(Long id, ActualizarEstadoPostulacionRequest request) {
        Postulacion postulacion = postulacionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("No existe la postulación con id " + id));
        postulacion.setEstado(EstadoPostulacion.desdeValor(request.estado()));
        return PostulacionMapper.toResponse(postulacionRepository.save(postulacion));
    }

    @Transactional(readOnly = true)
    public GoogleDriveService.Archivo descargarCv(Long id) {
        Postulacion postulacion = postulacionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("No existe la postulación con id " + id));
        if (postulacion.getCvDriveFileId() == null || postulacion.getCvDriveFileId().isBlank()) {
            throw new NotFoundException("La postulación no tiene un CV adjunto.");
        }
        return googleDriveService.descargar(postulacion.getCvDriveFileId());
    }

    private String normalizarRut(String rut) {
        String limpio = rut == null
                ? ""
                : rut.trim().toUpperCase().replaceAll("[^0-9K]", "");
        if (limpio.length() <= 1) {
            return limpio;
        }
        return limpio.substring(0, limpio.length() - 1)
                + "-"
                + limpio.substring(limpio.length() - 1);
    }

    private String normalizar(String valor) {
        return valor == null ? null : valor.trim();
    }
}
