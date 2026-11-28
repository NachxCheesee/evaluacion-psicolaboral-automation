package cl.aquachile.evalpsi.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.aquachile.evalpsi.dto.oferta.OfertaRequest;
import cl.aquachile.evalpsi.dto.oferta.OfertaResponse;
import cl.aquachile.evalpsi.exception.NotFoundException;
import cl.aquachile.evalpsi.mapper.OfertaMapper;
import cl.aquachile.evalpsi.model.Cuenta;
import cl.aquachile.evalpsi.model.Oferta;
import cl.aquachile.evalpsi.repository.CuentaRepository;
import cl.aquachile.evalpsi.repository.OfertaRepository;

@Service
public class OfertaService {

    private final OfertaRepository ofertaRepository;
    private final CuentaRepository cuentaRepository;

    public OfertaService(OfertaRepository ofertaRepository, CuentaRepository cuentaRepository) {
        this.ofertaRepository = ofertaRepository;
        this.cuentaRepository = cuentaRepository;
    }

    @Transactional(readOnly = true)
    public List<OfertaResponse> listarAdmin(String categoria) {
        List<Oferta> ofertas = (categoria == null || categoria.isBlank())
                ? ofertaRepository.findAllByOrderByFechaPublicacionDescIdDesc()
                : ofertaRepository.findAllByOrderByFechaPublicacionDescIdDesc().stream()
                        .filter(oferta -> oferta.getCategoria().equalsIgnoreCase(categoria.trim()))
                        .toList();

        return ofertas.stream().map(OfertaMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<OfertaResponse> listarPublicas(String categoria) {
        List<Oferta> ofertas = (categoria == null || categoria.isBlank())
                ? ofertaRepository.findByPublicadaTrueOrderByFechaPublicacionDescIdDesc()
                : ofertaRepository.findByPublicadaTrueAndCategoriaIgnoreCaseOrderByFechaPublicacionDescIdDesc(
                        categoria.trim());

        return ofertas.stream().map(OfertaMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OfertaResponse obtenerAdmin(Long id) {
        return OfertaMapper.toResponse(buscar(id));
    }

    @Transactional(readOnly = true)
    public OfertaResponse obtenerPublica(Long id) {
        Oferta oferta = buscar(id);
        if (!oferta.isPublicada()) {
            throw new NotFoundException("La oferta no está publicada.");
        }
        return OfertaMapper.toResponse(oferta);
    }

    @Transactional
    public OfertaResponse crear(OfertaRequest request) {
        Cuenta responsable = buscarResponsable(request.responsableId());
        Oferta oferta = OfertaMapper.toEntity(request, responsable);
        return OfertaMapper.toResponse(ofertaRepository.save(oferta));
    }

    @Transactional
    public OfertaResponse actualizar(Long id, OfertaRequest request) {
        Oferta oferta = buscar(id);
        Cuenta responsable = request.responsableId() == null
                ? oferta.getResponsable()
                : buscarResponsable(request.responsableId());
        OfertaMapper.aplicar(oferta, request, responsable);
        return OfertaMapper.toResponse(ofertaRepository.save(oferta));
    }

    @Transactional
    public OfertaResponse publicar(Long id) {
        Oferta oferta = buscar(id);
        oferta.setPublicada(true);
        return OfertaMapper.toResponse(ofertaRepository.save(oferta));
    }

    @Transactional
    public OfertaResponse despublicar(Long id) {
        Oferta oferta = buscar(id);
        oferta.setPublicada(false);
        return OfertaMapper.toResponse(ofertaRepository.save(oferta));
    }

    @Transactional
    public void eliminar(Long id) {
        ofertaRepository.delete(buscar(id));
    }

    @Transactional(readOnly = true)
    public Oferta buscar(Long id) {
        return ofertaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("No existe la oferta con id " + id));
    }

    private Cuenta buscarResponsable(Long responsableId) {
        if (responsableId == null) {
            return null;
        }
        return cuentaRepository.findById(responsableId)
                .orElseThrow(() -> new NotFoundException(
                        "No existe la cuenta responsable con id " + responsableId));
    }
}
