package cl.aquachile.evalpsi.controller;

import java.util.Arrays;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.aquachile.evalpsi.enums.EstadoSolicitud;
import cl.aquachile.evalpsi.enums.ResultadoEvaluacion;
import cl.aquachile.evalpsi.enums.Rol;

/**
 * Catálogos usados por los formularios del frontend.
 * Evita que las listas queden duplicadas y desincronizadas.
 */
@RestController
@RequestMapping("/api/catalogos")
@PreAuthorize("isAuthenticated()")
public class CatalogoController {

    private static final List<String> FAMILIAS_CARGO = List.of(
            "Operario Calificado",
            "Administrativo",
            "Técnico Especialista",
            "Jefatura / Supervisión",
            "Profesional"
    );

    @GetMapping("/familias-cargo")
    public List<String> familiasCargo() {
        return FAMILIAS_CARGO;
    }

    @GetMapping("/estados")
    public List<String> estados() {
        return Arrays.stream(EstadoSolicitud.values())
                .map(EstadoSolicitud::getValor)
                .toList();
    }

    @GetMapping("/resultados")
    public List<String> resultados() {
        return Arrays.stream(ResultadoEvaluacion.values())
                .filter(resultado -> resultado != ResultadoEvaluacion.SIN_RESULTADO)
                .map(ResultadoEvaluacion::getValor)
                .toList();
    }

    @GetMapping("/roles")
    public List<String> roles() {
        return Arrays.stream(Rol.values())
                .map(Enum::name)
                .toList();
    }
}
