package cl.aquachile.evalpsi.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.aquachile.evalpsi.model.Postulante;

public interface PostulanteRepository extends JpaRepository<Postulante, Long> {

    Optional<Postulante> findByRut(String rut);
}
