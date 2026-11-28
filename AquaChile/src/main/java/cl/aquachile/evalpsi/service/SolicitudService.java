package cl.aquachile.evalpsi.service;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import cl.aquachile.evalpsi.dto.PageResponse;
import cl.aquachile.evalpsi.dto.solicitud.ActualizarEvaluacionRequest;
import cl.aquachile.evalpsi.dto.solicitud.SolicitudRequest;
import cl.aquachile.evalpsi.dto.solicitud.SolicitudResponse;
import cl.aquachile.evalpsi.enums.EstadoSolicitud;
import cl.aquachile.evalpsi.exception.BadRequestException;
import cl.aquachile.evalpsi.exception.NotFoundException;
import cl.aquachile.evalpsi.exception.PostulacionesExcedidasException;
import cl.aquachile.evalpsi.mapper.SolicitudMapper;
import cl.aquachile.evalpsi.model.Evaluacion;
import cl.aquachile.evalpsi.model.Oferta;
import cl.aquachile.evalpsi.model.Postulante;
import cl.aquachile.evalpsi.model.Solicitud;
import cl.aquachile.evalpsi.repository.SolicitudRepository;
import jakarta.persistence.criteria.Predicate;

@Service
public class SolicitudService {

    private static final Set<String> CAMPOS_ORDEN = Set.of(
            "id", "fechaSolicitud", "candidato", "cargo", "estado"
    );

    private static final int MAX_POSTULACIONES_DIA = 3;

    private final SolicitudRepository solicitudRepository;
    private final GoogleDriveService googleDriveService;
    private final EmailService emailService;
    private final CvValidator cvValidator;

    public SolicitudService(SolicitudRepository solicitudRepository,
                            GoogleDriveService googleDriveService,
                            EmailService emailService,
                            CvValidator cvValidator) {
        this.solicitudRepository = solicitudRepository;
        this.googleDriveService = googleDriveService;
        this.emailService = emailService;
        this.cvValidator = cvValidator;
    }

    @Transactional(readOnly = true)
    public PageResponse<SolicitudResponse> listar(String busqueda,
                                                  String estado,
                                                  int page,
                                                  int size,
                                                  String sort,
                                                  String direction) {

        int pagina = Math.max(page, 0);
        int tamano = Math.min(Math.max(size, 1), 100);

        String campo = CAMPOS_ORDEN.contains(sort) ? sort : "fechaSolicitud";
        Sort.Direction direccion = "asc".equalsIgnoreCase(direction)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        EstadoSolicitud filtroEstado = (estado == null || estado.isBlank() || "TODOS".equalsIgnoreCase(estado))
                ? null
                : SolicitudMapper.parseEstado(estado, null);

        String filtroBusqueda = (busqueda == null || busqueda.isBlank()) ? null : busqueda.trim();

        Specification<Solicitud> especificacion = (root, query, cb) -> {
            List<Predicate> condiciones = new ArrayList<>();

            if (filtroEstado != null) {
                condiciones.add(cb.equal(root.get("estado"), filtroEstado));
            }

            if (filtroBusqueda != null) {
                String patron = "%" + filtroBusqueda.toLowerCase() + "%";
                condiciones.add(cb.or(
                        cb.like(cb.lower(root.get("candidato")), patron),
                        cb.like(cb.lower(root.get("rut")), patron),
                        cb.like(cb.lower(root.get("cargo")), patron)
                ));
            }

            return cb.and(condiciones.toArray(new Predicate[0]));
        };

        Page<Solicitud> resultado = solicitudRepository.findAll(
                especificacion,
                PageRequest.of(pagina, tamano, Sort.by(direccion, campo))
        );

        return PageResponse.from(resultado.map(SolicitudMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public SolicitudResponse obtener(Long id) {
        return SolicitudMapper.toResponse(buscar(id));
    }

    @Transactional
    public SolicitudResponse crear(SolicitudRequest request) {
        validarLimite(request.rut());

        Solicitud solicitud = SolicitudMapper.toEntity(request);
        Solicitud guardada = solicitudRepository.save(solicitud);
        emailService.confirmacionPostulacion(guardada.getCorreo(), guardada.getCandidato(), guardada.getCargo());
        return SolicitudMapper.toResponse(guardada);
    }

    @Transactional
    public Solicitud crearDesdePostulacion(Postulante postulante,
                                           Oferta oferta,
                                           String cvNombre,
                                           String cvDriveFileId,
                                           String observaciones) {
        validarLimite(postulante.getRut());

        String responsable = oferta.getResponsable() == null
                ? null
                : oferta.getResponsable().getNombre();

        Solicitud solicitud = Solicitud.builder()
                .rut(postulante.getRut())
                .candidato(postulante.getNombre())
                .correo(postulante.getCorreo())
                .telefono(postulante.getTelefono())
                .cargo(oferta.getCargo())
                .familiaCargo(oferta.getCategoria())
                .fechaSolicitud(LocalDate.now())
                .solicitadoPor("Portal Público Web")
                .responsable(responsable)
                .cvAdjunto(cvNombre)
                .cvDriveFileId(cvDriveFileId)
                .estado(EstadoSolicitud.PENDIENTE)
                .observaciones(observaciones)
                .evaluacion(Evaluacion.vacia())
                .build();

        Solicitud guardada = solicitudRepository.save(solicitud);
        emailService.confirmacionPostulacion(
                guardada.getCorreo(), guardada.getCandidato(), guardada.getCargo());
        return guardada;
    }

    @Transactional
    public SolicitudResponse actualizar(Long id, SolicitudRequest request) {
        Solicitud solicitud = buscar(id);
        SolicitudMapper.aplicar(solicitud, request);
        return SolicitudMapper.toResponse(solicitudRepository.save(solicitud));
    }

    @Transactional
    public SolicitudResponse actualizarEvaluacion(Long id, ActualizarEvaluacionRequest request) {
        Solicitud solicitud = buscar(id);
        String estadoAnterior = solicitud.getEstado() == null ? null : solicitud.getEstado().getValor();

        solicitud.setEstado(SolicitudMapper.parseEstado(request.estado(), solicitud.getEstado()));
        solicitud.setEvaluacion(SolicitudMapper.mezclar(solicitud.getEvaluacion(), request.evaluacion()));
        solicitudRepository.save(solicitud);

        String estadoNuevo = solicitud.getEstado().getValor();
        if (estadoAnterior != null && !estadoAnterior.equals(estadoNuevo)) {
            emailService.cambioEstado(solicitud.getCorreo(), solicitud.getCandidato(), estadoNuevo);
        }

        return SolicitudMapper.toResponse(solicitud);
    }

    @Transactional
    public void eliminar(Long id) {
        solicitudRepository.delete(buscar(id));
    }

    @Transactional
    public SolicitudResponse subirCv(Long id, MultipartFile archivo) {
        Solicitud solicitud = buscar(id);
        cvValidator.validar(archivo);

        if (solicitud.getCvDriveFileId() != null && esAnalista()) {
            throw new AccessDeniedException("Solo ADMIN y EVALUADOR pueden reemplazar un CV existente.");
        }

        String rut = solicitud.getRut();
        if (rut == null || rut.isBlank()) {
            throw new BadRequestException("La solicitud no tiene RUT, no se puede subir el CV.");
        }

        String nombre = cvValidator.nombreArchivo(archivo);
        String contentType = archivo.getContentType() != null ? archivo.getContentType() : "application/octet-stream";
        byte[] contenido;
        try {
            contenido = archivo.getBytes();
        } catch (IOException ex) {
            throw new BadRequestException("No se pudo leer el archivo del CV.");
        }

        String raizId = googleDriveService.obtenerOCrearCarpetaRaiz();
        String carpetaId = googleDriveService.obtenerOCrearCarpetaCandidato(raizId, solicitud.getCandidato(), rut);
        String nuevoFileId = googleDriveService.subir(carpetaId, nombre, contentType, contenido);

        String anteriorFileId = solicitud.getCvDriveFileId();
        solicitud.setCvAdjunto(nombre);
        solicitud.setCvDriveFileId(nuevoFileId);

        try {
            solicitudRepository.save(solicitud);
        } catch (RuntimeException ex) {
            googleDriveService.borrar(nuevoFileId);
            throw ex;
        }

        if (anteriorFileId != null && !anteriorFileId.equals(nuevoFileId)) {
            googleDriveService.borrar(anteriorFileId);
        }

        return SolicitudMapper.toResponse(solicitud);
    }

    @Transactional(readOnly = true)
    public GoogleDriveService.Archivo descargarCv(Long id) {
        Solicitud solicitud = buscar(id);
        String fileId = solicitud.getCvDriveFileId();
        if (fileId == null || fileId.isBlank()) {
            throw new NotFoundException("La solicitud no tiene un CV adjunto.");
        }
        return googleDriveService.descargar(fileId);
    }

    private boolean esAnalista() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ANALISTA".equals(authority.getAuthority()));
    }

    private void validarLimite(String rut) {
        String valor = rut == null ? null : rut.trim();
        if (valor == null || valor.isBlank()) {
            return;
        }
        Instant inicioHoy = LocalDate.now(ZoneId.systemDefault())
                .atStartOfDay(ZoneId.systemDefault())
                .toInstant();
        long postulacionesHoy = solicitudRepository.countByRutAndCreatedAtAfter(valor, inicioHoy);
        if (postulacionesHoy >= MAX_POSTULACIONES_DIA) {
            throw new PostulacionesExcedidasException(
                    "Ya alcanzaste el máximo de " + MAX_POSTULACIONES_DIA + " postulaciones por día.");
        }
    }

    private Solicitud buscar(Long id) {
        return solicitudRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("No existe la solicitud con id " + id));
    }
}
