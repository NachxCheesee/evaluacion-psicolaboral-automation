package cl.aquachile.evalpsi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import cl.aquachile.evalpsi.dto.oferta.OfertaRequest;
import cl.aquachile.evalpsi.enums.ModalidadOferta;
import cl.aquachile.evalpsi.exception.NotFoundException;
import cl.aquachile.evalpsi.model.Cuenta;
import cl.aquachile.evalpsi.model.Oferta;
import cl.aquachile.evalpsi.repository.CuentaRepository;
import cl.aquachile.evalpsi.repository.OfertaRepository;

@ExtendWith(MockitoExtension.class)
class OfertaServiceTest {

    @Mock
    private OfertaRepository ofertaRepository;

    @Mock
    private CuentaRepository cuentaRepository;

    @InjectMocks
    private OfertaService ofertaService;

    private Oferta oferta;
    private OfertaRequest request;

    @BeforeEach
    void setUp() {
        Cuenta responsable = Cuenta.builder()
                .id(2L)
                .nombre("Camila Muñoz")
                .correo("analista@aquachile.cl")
                .build();

        oferta = Oferta.builder()
                .id(1L)
                .cargo("Operario")
                .categoria("Operario Calificado")
                .ubicacion("Puerto Montt")
                .modalidad(ModalidadOferta.PRESENCIAL)
                .fechaPublicacion(LocalDate.now())
                .cupos(3)
                .publicada(false)
                .responsable(responsable)
                .build();

        request = new OfertaRequest(
                "Operario", "Operario Calificado", "Puerto Montt", "PRESENCIAL",
                LocalDate.now(), 3, "Desc", "Func", "Req", "Ben", "$800.000", false, 2L);
    }

    @Test
    void listaTodasYFiltraCategoria() {
        when(ofertaRepository.findAllByOrderByFechaPublicacionDescIdDesc()).thenReturn(List.of(oferta));

        assertEquals(1, ofertaService.listarAdmin(null).size());
        assertEquals(1, ofertaService.listarAdmin("operario calificado").size());
        assertEquals(0, ofertaService.listarAdmin("Profesional").size());
    }

    @Test
    void listaPublicasConYsinCategoria() {
        when(ofertaRepository.findByPublicadaTrueOrderByFechaPublicacionDescIdDesc()).thenReturn(List.of(oferta));
        when(ofertaRepository.findByPublicadaTrueAndCategoriaIgnoreCaseOrderByFechaPublicacionDescIdDesc(any()))
                .thenReturn(List.of(oferta));

        assertEquals(1, ofertaService.listarPublicas(null).size());
        assertEquals(1, ofertaService.listarPublicas("Operario Calificado").size());
    }

    @Test
    void obtieneOfertaPublicadaYRechazaBorrador() {
        when(ofertaRepository.findById(1L)).thenReturn(Optional.of(oferta));
        assertThrows(NotFoundException.class, () -> ofertaService.obtenerPublica(1L));

        oferta.setPublicada(true);
        assertEquals("Operario", ofertaService.obtenerPublica(1L).cargo());
    }

    @Test
    void creaYActualizaOfertaConResponsable() {
        when(cuentaRepository.findById(2L)).thenReturn(Optional.of(oferta.getResponsable()));
        when(ofertaRepository.save(any(Oferta.class))).thenAnswer(invocation -> {
            Oferta guardada = invocation.getArgument(0);
            guardada.setId(9L);
            return guardada;
        });

        var creada = ofertaService.crear(request);
        assertEquals(9L, creada.id());
        assertEquals("Camila Muñoz", creada.responsableNombre());

        when(ofertaRepository.findById(1L)).thenReturn(Optional.of(oferta));
        var actualizada = ofertaService.actualizar(1L, request);
        assertEquals("Operario", actualizada.cargo());
    }

    @Test
    void creaSinResponsable() {
        OfertaRequest sinResponsable = new OfertaRequest(
                "Operario", "Operario Calificado", "Puerto Montt", "PRESENCIAL",
                null, 3, null, null, null, null, null, true, null);
        when(ofertaRepository.save(any(Oferta.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var creada = ofertaService.crear(sinResponsable);
        assertTrue(creada.publicada());
        assertEquals(null, creada.responsableId());
    }

    @Test
    void publicaDespublicaYElimina() {
        when(ofertaRepository.findById(1L)).thenReturn(Optional.of(oferta));
        when(ofertaRepository.save(any(Oferta.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertTrue(ofertaService.publicar(1L).publicada());
        oferta.setPublicada(true);
        assertFalse(ofertaService.despublicar(1L).publicada());

        ofertaService.eliminar(1L);
        verify(ofertaRepository).delete(oferta);
    }

    @Test
    void rechazaResponsableInexistente() {
        when(cuentaRepository.findById(99L)).thenReturn(Optional.empty());
        OfertaRequest conResponsableMalo = new OfertaRequest(
                "Operario", "Operario Calificado", "Puerto Montt", "PRESENCIAL",
                null, 3, null, null, null, null, null, false, 99L);

        assertThrows(NotFoundException.class, () -> ofertaService.crear(conResponsableMalo));
    }
}
