package cl.aquachile.evalpsi.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import cl.aquachile.evalpsi.dto.oferta.OfertaResponse;
import cl.aquachile.evalpsi.dto.postulacion.PostulacionRequest;
import cl.aquachile.evalpsi.dto.postulacion.PostulacionResponse;
import cl.aquachile.evalpsi.service.OfertaService;
import cl.aquachile.evalpsi.service.PostulacionService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ofertas/publicas")
public class OfertaPublicaController {

    private final OfertaService ofertaService;
    private final PostulacionService postulacionService;

    public OfertaPublicaController(OfertaService ofertaService,
                                   PostulacionService postulacionService) {
        this.ofertaService = ofertaService;
        this.postulacionService = postulacionService;
    }

    @GetMapping
    public List<OfertaResponse> listar(@RequestParam(required = false) String categoria) {
        return ofertaService.listarPublicas(categoria);
    }

    @GetMapping("/{id}")
    public OfertaResponse obtener(@PathVariable Long id) {
        return ofertaService.obtenerPublica(id);
    }

    @PostMapping(
            value = "/{id}/postular",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @ResponseStatus(HttpStatus.CREATED)
    public PostulacionResponse postular(@PathVariable Long id,
                                        @Valid @RequestPart("datos") PostulacionRequest datos,
                                        @RequestPart("cv") MultipartFile cv) {
        return postulacionService.postular(id, datos, cv);
    }
}
