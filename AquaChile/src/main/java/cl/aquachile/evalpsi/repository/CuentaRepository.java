package cl.aquachile.evalpsi.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.aquachile.evalpsi.model.Cuenta;

public interface CuentaRepository extends JpaRepository<Cuenta, Long> {

    Optional<Cuenta> findByCorreoIgnoreCase(String correo);

    boolean existsByCorreoIgnoreCase(String correo);
}
