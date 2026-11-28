package cl.aquachile.evalpsi.controller;

import java.util.List;

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

import cl.aquachile.evalpsi.dto.oferta.OfertaRequest;
import cl.aquachile.evalpsi.dto.oferta.OfertaResponse;
import cl.aquachile.evalpsi.dto.postulacion.PostulacionResponse;
import cl.aquachile.evalpsi.service.OfertaService;
import cl.aquachile.evalpsi.service.PostulacionService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ofertas")
@PreAuthorize("hasAnyRole('ADMIN', 'ANALISTA')")
public class OfertaController {

    private final OfertaService ofertaService;
    private final PostulacionService postulacionService;

    public OfertaController(OfertaService ofertaService, PostulacionService postulacionService) {
        this.ofertaService = ofertaService;
        this.postulacionService = postulacionService;
    }

    @GetMapping
    public List<OfertaResponse> listar(@RequestParam(required = false) String categoria) {
        return ofertaService.listarAdmin(categoria);
    }

    @GetMapping("/{id}")
    public OfertaResponse obtener(@PathVariable Long id) {
        return ofertaService.obtenerAdmin(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OfertaResponse crear(@Valid @RequestBody OfertaRequest request) {
        return ofertaService.crear(request);
    }

    @PutMapping("/{id}")
    public OfertaResponse actualizar(@PathVariable Long id,
                                     @Valid @RequestBody OfertaRequest request) {
        return ofertaService.actualizar(id, request);
    }

    @PatchMapping("/{id}/publicar")
    public OfertaResponse publicar(@PathVariable Long id) {
        return ofertaService.publicar(id);
    }

    @PatchMapping("/{id}/despublicar")
    public OfertaResponse despublicar(@PathVariable Long id) {
        return ofertaService.despublicar(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        ofertaService.eliminar(id);
    }

    @GetMapping("/{id}/postulaciones")
    public List<PostulacionResponse> postulaciones(@PathVariable Long id) {
        return postulacionService.listarPorOferta(id);
    }
}
