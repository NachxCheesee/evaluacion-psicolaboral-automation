package cl.aquachile.evalpsi.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.aquachile.evalpsi.model.Postulacion;

public interface PostulacionRepository extends JpaRepository<Postulacion, Long> {

    boolean existsByOfertaIdAndPostulanteId(Long ofertaId, Long postulanteId);

    long countByOfertaId(Long ofertaId);

    List<Postulacion> findByOfertaIdOrderByCreatedAtDesc(Long ofertaId);
}
