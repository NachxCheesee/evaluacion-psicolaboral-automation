package cl.aquachile.evalpsi.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.aquachile.evalpsi.dto.PageResponse;
import cl.aquachile.evalpsi.dto.solicitud.ActualizarEvaluacionRequest;
import cl.aquachile.evalpsi.dto.solicitud.SolicitudRequest;
import cl.aquachile.evalpsi.dto.solicitud.SolicitudResponse;
import cl.aquachile.evalpsi.enums.EstadoSolicitud;
import cl.aquachile.evalpsi.exception.NotFoundException;
import cl.aquachile.evalpsi.mapper.SolicitudMapper;
import cl.aquachile.evalpsi.model.Solicitud;
import cl.aquachile.evalpsi.repository.SolicitudRepository;
import jakarta.persistence.criteria.Predicate;

@Service
public class SolicitudService {

    private static final Set<String> CAMPOS_ORDEN = Set.of(
            "id", "fechaSolicitud", "candidato", "cargo", "estado"
    );

    private final SolicitudRepository solicitudRepository;

    public SolicitudService(SolicitudRepository solicitudRepository) {
        this.solicitudRepository = solicitudRepository;
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
        Solicitud solicitud = SolicitudMapper.toEntity(request);
        return SolicitudMapper.toResponse(solicitudRepository.save(solicitud));
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

        solicitud.setEstado(SolicitudMapper.parseEstado(request.estado(), solicitud.getEstado()));
        solicitud.setEvaluacion(SolicitudMapper.mezclar(solicitud.getEvaluacion(), request.evaluacion()));

        return SolicitudMapper.toResponse(solicitudRepository.save(solicitud));
    }

    @Transactional
    public void eliminar(Long id) {
        solicitudRepository.delete(buscar(id));
    }

    private Solicitud buscar(Long id) {
        return solicitudRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("No existe la solicitud con id " + id));
    }
}
