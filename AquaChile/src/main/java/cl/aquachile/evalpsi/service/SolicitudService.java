package cl.aquachile.evalpsi.service;

import java.io.IOException;
import java.io.InputStream;
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
import cl.aquachile.evalpsi.model.Solicitud;
import cl.aquachile.evalpsi.repository.SolicitudRepository;
import jakarta.persistence.criteria.Predicate;

@Service
public class SolicitudService {

    private static final Set<String> CAMPOS_ORDEN = Set.of(
            "id", "fechaSolicitud", "candidato", "cargo", "estado"
    );

    private static final Set<String> EXTENSIONES_CV = Set.of("pdf", "doc", "docx");
    private static final long MAX_CV_BYTES = 10L * 1024 * 1024;
    private static final int MAX_POSTULACIONES_DIA = 3;

    private final SolicitudRepository solicitudRepository;
    private final GoogleDriveService googleDriveService;
    private final EmailService emailService;

    public SolicitudService(SolicitudRepository solicitudRepository,
                            GoogleDriveService googleDriveService,
                            EmailService emailService) {
        this.solicitudRepository = solicitudRepository;
        this.googleDriveService = googleDriveService;
        this.emailService = emailService;
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
        String rut = request.rut() == null ? null : request.rut().trim();
        if (rut != null && !rut.isBlank()) {
            Instant inicioHoy = LocalDate.now(ZoneId.systemDefault())
                    .atStartOfDay(ZoneId.systemDefault())
                    .toInstant();
            long postulacionesHoy = solicitudRepository.countByRutAndCreatedAtAfter(rut, inicioHoy);
            if (postulacionesHoy >= MAX_POSTULACIONES_DIA) {
                throw new PostulacionesExcedidasException(
                        "Ya alcanzaste el máximo de " + MAX_POSTULACIONES_DIA + " postulaciones por día.");
            }
        }

        Solicitud solicitud = SolicitudMapper.toEntity(request);
        Solicitud guardada = solicitudRepository.save(solicitud);
        emailService.confirmacionPostulacion(guardada.getCorreo(), guardada.getCandidato(), guardada.getCargo());
        return SolicitudMapper.toResponse(guardada);
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
        validarCv(archivo);

        if (solicitud.getCvDriveFileId() != null && esAnalista()) {
            throw new AccessDeniedException("Solo ADMIN y EVALUADOR pueden reemplazar un CV existente.");
        }

        String rut = solicitud.getRut();
        if (rut == null || rut.isBlank()) {
            throw new BadRequestException("La solicitud no tiene RUT, no se puede subir el CV.");
        }

        String nombre = archivo.getOriginalFilename() != null ? archivo.getOriginalFilename() : "CV";
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

    private void validarCv(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new BadRequestException("El archivo del CV está vacío.");
        }
        if (archivo.getSize() > MAX_CV_BYTES) {
            throw new BadRequestException("El CV supera el tamaño máximo de 10 MB.");
        }

        String nombre = archivo.getOriginalFilename();
        String extension = (nombre != null && nombre.contains("."))
                ? nombre.substring(nombre.lastIndexOf('.') + 1).toLowerCase()
                : "";
        if (!EXTENSIONES_CV.contains(extension)) {
            throw new BadRequestException("El CV debe ser un archivo PDF, DOC o DOCX.");
        }

        byte[] cabecera;
        try (InputStream in = archivo.getInputStream()) {
            cabecera = in.readNBytes(8);
        } catch (IOException ex) {
            throw new BadRequestException("No se pudo leer el archivo del CV.");
        }

        boolean contenidoValido = switch (extension) {
            case "pdf" -> esPdf(cabecera);
            case "docx" -> esZip(cabecera);
            case "doc" -> esOle(cabecera);
            default -> false;
        };
        if (!contenidoValido) {
            throw new BadRequestException("El contenido del archivo no coincide con la extensión " + extension + ".");
        }
    }

    private boolean esPdf(byte[] b) {
        return b.length >= 4
                && (b[0] & 0xFF) == 0x25 && (b[1] & 0xFF) == 0x50
                && (b[2] & 0xFF) == 0x44 && (b[3] & 0xFF) == 0x46;
    }

    private boolean esOle(byte[] b) {
        return b.length >= 8
                && (b[0] & 0xFF) == 0xD0 && (b[1] & 0xFF) == 0xCF
                && (b[2] & 0xFF) == 0x11 && (b[3] & 0xFF) == 0xE0;
    }

    private boolean esZip(byte[] b) {
        return b.length >= 4
                && (b[0] & 0xFF) == 0x50 && (b[1] & 0xFF) == 0x4B
                && (b[2] & 0xFF) == 0x03 && (b[3] & 0xFF) == 0x04;
    }

    private Solicitud buscar(Long id) {
        return solicitudRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("No existe la solicitud con id " + id));
    }
}
