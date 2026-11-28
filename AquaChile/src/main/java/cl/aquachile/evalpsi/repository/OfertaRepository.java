package cl.aquachile.evalpsi.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.aquachile.evalpsi.model.Oferta;

public interface OfertaRepository extends JpaRepository<Oferta, Long> {

    List<Oferta> findAllByOrderByFechaPublicacionDescIdDesc();

    List<Oferta> findByPublicadaTrueOrderByFechaPublicacionDescIdDesc();

    List<Oferta> findByPublicadaTrueAndCategoriaIgnoreCaseOrderByFechaPublicacionDescIdDesc(String categoria);
}
