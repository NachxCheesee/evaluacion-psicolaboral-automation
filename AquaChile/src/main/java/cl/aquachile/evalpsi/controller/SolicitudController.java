package cl.aquachile.evalpsi.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import cl.aquachile.evalpsi.dto.PageResponse;
import cl.aquachile.evalpsi.dto.solicitud.ActualizarEvaluacionRequest;
import cl.aquachile.evalpsi.dto.solicitud.SolicitudRequest;
import cl.aquachile.evalpsi.dto.solicitud.SolicitudResponse;
import cl.aquachile.evalpsi.service.SolicitudService;
import jakarta.validation.Valid;

/**
 * CRUD de solicitudes de evaluación psicolaboral.
 *
 * <p>Reglas de rol (las mismas del frontend):
 * ANALISTA puede crear y consultar; EVALUADOR y ADMIN pueden editar,
 * evaluar y eliminar.</p>
 */
@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {

    private final SolicitudService solicitudService;

    public SolicitudController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALISTA', 'EVALUADOR')")
    public PageResponse<SolicitudResponse> listar(
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fechaSolicitud") String sort,
            @RequestParam(defaultValue = "desc") String direction) {

        return solicitudService.listar(busqueda, estado, page, size, sort, direction);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALISTA', 'EVALUADOR')")
    public SolicitudResponse obtener(@PathVariable Long id) {
        return solicitudService.obtener(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'ANALISTA', 'EVALUADOR')")
    public SolicitudResponse crear(@Valid @RequestBody SolicitudRequest request) {
        return solicitudService.crear(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVALUADOR')")
    public SolicitudResponse actualizar(@PathVariable Long id,
                                        @Valid @RequestBody SolicitudRequest request) {
        return solicitudService.actualizar(id, request);
    }

    @PatchMapping("/{id}/evaluacion")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVALUADOR')")
    public SolicitudResponse actualizarEvaluacion(@PathVariable Long id,
                                                  @Valid @RequestBody ActualizarEvaluacionRequest request) {
        return solicitudService.actualizarEvaluacion(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN', 'EVALUADOR')")
    public void eliminar(@PathVariable Long id) {
        solicitudService.eliminar(id);
    }
}
