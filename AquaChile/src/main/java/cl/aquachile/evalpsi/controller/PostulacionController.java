package cl.aquachile.evalpsi.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.aquachile.evalpsi.dto.postulacion.ActualizarEstadoPostulacionRequest;
import cl.aquachile.evalpsi.dto.postulacion.PostulacionResponse;
import cl.aquachile.evalpsi.service.GoogleDriveService;
import cl.aquachile.evalpsi.service.PostulacionService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/postulaciones")
@PreAuthorize("hasAnyRole('ADMIN', 'ANALISTA')")
public class PostulacionController {

    private final PostulacionService postulacionService;

    public PostulacionController(PostulacionService postulacionService) {
        this.postulacionService = postulacionService;
    }

    @PatchMapping("/{id}/estado")
    public PostulacionResponse actualizarEstado(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarEstadoPostulacionRequest request) {
        return postulacionService.actualizarEstado(id, request);
    }

    @GetMapping("/{id}/cv")
    public ResponseEntity<byte[]> descargarCv(@PathVariable Long id) {
        GoogleDriveService.Archivo archivo = postulacionService.descargarCv(id);
        String nombre = archivo.nombre() == null ? "cv" : archivo.nombre().replace("\"", "");
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(archivo.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + nombre + "\"")
                .body(archivo.contenido());
    }
}
