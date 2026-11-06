package cl.aquachile.evalpsi.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import cl.aquachile.evalpsi.model.Solicitud;

/**
 * Repositorio de solicitudes.
 *
 * <p>Los filtros se construyen con Specifications en el servicio: así solo
 * se agregan las condiciones que el cliente realmente envía y evitamos
 * parámetros nulos sin tipo, que PostgreSQL interpreta como bytea.</p>
 */
public interface SolicitudRepository extends JpaRepository<Solicitud, Long>,
        JpaSpecificationExecutor<Solicitud> {
}
