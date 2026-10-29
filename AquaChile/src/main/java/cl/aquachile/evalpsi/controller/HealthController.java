package cl.aquachile.evalpsi.controller;

import java.time.Instant;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.aquachile.evalpsi.dto.HealthResponse;

/**
 * Endpoint de verificación usado para comprobar que el microservicio está vivo.
 * Es público (ver SecurityConfig) y sirve como primer smoke test de la Parte 1.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<HealthResponse> health() {
        return ResponseEntity.ok(new HealthResponse(
                "UP",
                "AquaChile",
                "1.0.0",
                Instant.now()
        ));
    }
}
