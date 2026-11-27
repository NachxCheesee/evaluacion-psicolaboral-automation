package cl.aquachile.evalpsi.repository;

import java.time.Instant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import cl.aquachile.evalpsi.model.Solicitud;

public interface SolicitudRepository extends JpaRepository<Solicitud, Long>,
        JpaSpecificationExecutor<Solicitud> {

    long countByRutAndCreatedAtAfter(String rut, Instant desde);
}
