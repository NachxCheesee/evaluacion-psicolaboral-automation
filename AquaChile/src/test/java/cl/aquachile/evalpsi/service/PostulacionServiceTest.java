package cl.aquachile.evalpsi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
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
import org.springframework.mock.web.MockMultipartFile;

import cl.aquachile.evalpsi.dto.postulacion.ActualizarEstadoPostulacionRequest;
import cl.aquachile.evalpsi.dto.postulacion.PostulacionRequest;
import cl.aquachile.evalpsi.enums.EstadoPostulacion;
import cl.aquachile.evalpsi.enums.ModalidadOferta;
import cl.aquachile.evalpsi.exception.BadRequestException;
import cl.aquachile.evalpsi.exception.ConflictException;
import cl.aquachile.evalpsi.exception.NotFoundException;
import cl.aquachile.evalpsi.model.Oferta;
import cl.aquachile.evalpsi.model.Postulacion;
import cl.aquachile.evalpsi.model.Postulante;
import cl.aquachile.evalpsi.model.Solicitud;
import cl.aquachile.evalpsi.repository.OfertaRepository;
import cl.aquachile.evalpsi.repository.PostulacionRepository;
import cl.aquachile.evalpsi.repository.PostulanteRepository;

@ExtendWith(MockitoExtension.class)
class PostulacionServiceTest {

    @Mock
    private PostulacionRepository postulacionRepository;

    @Mock
    private PostulanteRepository postulanteRepository;

    @Mock
    private OfertaRepository ofertaRepository;

    @Mock
    private SolicitudService solicitudService;

    @Mock
    private GoogleDriveService googleDriveService;

    @Mock
    private CvValidator cvValidator;

    @InjectMocks
    private PostulacionService postulacionService;

    private Oferta oferta;
    private PostulacionRequest request;
    private MockMultipartFile cv;

    @BeforeEach
    void setUp() {
        oferta = Oferta.builder()
                .id(10L)
                .cargo("Operario")
                .categoria("Operario Calificado")
                .ubicacion("Puerto Montt")
                .modalidad(ModalidadOferta.PRESENCIAL)
                .fechaPublicacion(LocalDate.now())
                .cupos(2)
                .publicada(true)
                .build();

        request = new PostulacionRequest(
                "Juan Pérez", "12.345.678-9", "juan@example.com", "+56912345678", "Experiencia previa");
        cv = new MockMultipartFile("cv", "cv.pdf", "application/pdf", new byte[]{0x25, 0x50, 0x44, 0x46});
    }

    @Test
    void postulaCorrectamenteYEnlazaSolicitud() {
        when(ofertaRepository.findById(10L)).thenReturn(Optional.of(oferta));
        when(postulacionRepository.countByOfertaId(10L)).thenReturn(0L);
        when(postulanteRepository.findByRut("12345678-9")).thenReturn(Optional.empty());
        when(postulanteRepository.save(any(Postulante.class))).thenAnswer(invocation -> {
            Postulante p = invocation.getArgument(0);
            p.setId(5L);
            return p;
        });
        when(postulacionRepository.existsByOfertaIdAndPostulanteId(10L, 5L)).thenReturn(false);
        when(googleDriveService.obtenerOCrearCarpetaRaiz()).thenReturn("root-1");
        when(googleDriveService.obtenerOCrearCarpetaCandidato(anyString(), anyString(), anyString()))
                .thenReturn("folder-1");
        when(cvValidator.nombreArchivo(cv)).thenReturn("cv.pdf");
        when(googleDriveService.subir(anyString(), anyString(), anyString(), any(byte[].class)))
                .thenReturn("file-1");
        when(solicitudService.crearDesdePostulacion(any(), any(), anyString(), anyString(), anyString()))
                .thenReturn(Solicitud.builder().id(7L).build());
        when(postulacionRepository.save(any(Postulacion.class))).thenAnswer(invocation -> {
            Postulacion p = invocation.getArgument(0);
            p.setId(20L);
            return p;
        });

        var response = postulacionService.postular(10L, request, cv);

        assertEquals(20L, response.id());
        assertEquals(7L, response.solicitudId());
        assertEquals("file-1", response.cvDriveFileId());
        assertEquals("RECIBIDA", response.estado());
        verify(cvValidator).validar(cv);
    }

    @Test
    void rechazaOfertaNoPublicadaInexistenteYSinCupos() {
        when(ofertaRepository.findById(10L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> postulacionService.postular(10L, request, cv));

        oferta.setPublicada(false);
        when(ofertaRepository.findById(10L)).thenReturn(Optional.of(oferta));
        assertThrows(BadRequestException.class, () -> postulacionService.postular(10L, request, cv));

        oferta.setPublicada(true);
        when(postulacionRepository.countByOfertaId(10L)).thenReturn(2L);
        assertThrows(BadRequestException.class, () -> postulacionService.postular(10L, request, cv));
    }

    @Test
    void rechazaPostulacionDuplicada() {
        when(ofertaRepository.findById(10L)).thenReturn(Optional.of(oferta));
        when(postulacionRepository.countByOfertaId(10L)).thenReturn(0L);
        Postulante existente = Postulante.builder().id(5L).rut("12345678-9").nombre("Juan").build();
        when(postulanteRepository.findByRut("12345678-9")).thenReturn(Optional.of(existente));
        when(postulanteRepository.save(any(Postulante.class))).thenReturn(existente);
        when(postulacionRepository.existsByOfertaIdAndPostulanteId(10L, 5L)).thenReturn(true);

        assertThrows(ConflictException.class, () -> postulacionService.postular(10L, request, cv));
        verify(googleDriveService, never()).subir(anyString(), anyString(), anyString(), any(byte[].class));
    }

    @Test
    void rechazaCvInvalido() {
        when(ofertaRepository.findById(10L)).thenReturn(Optional.of(oferta));
        when(postulacionRepository.countByOfertaId(10L)).thenReturn(0L);
        when(postulanteRepository.findByRut(anyString())).thenReturn(Optional.empty());
        when(postulanteRepository.save(any(Postulante.class))).thenAnswer(invocation -> {
            Postulante p = invocation.getArgument(0);
            p.setId(5L);
            return p;
        });
        doThrow(new BadRequestException("CV inválido")).when(cvValidator).validar(cv);

        assertThrows(BadRequestException.class, () -> postulacionService.postular(10L, request, cv));
    }

    @Test
    void listaPostulacionesPorOferta() {
        when(ofertaRepository.existsById(10L)).thenReturn(true);
        when(postulacionRepository.findByOfertaIdOrderByCreatedAtDesc(10L))
                .thenReturn(List.of(Postulacion.builder().id(1L).oferta(oferta).estado(EstadoPostulacion.RECIBIDA).build()));

        assertEquals(1, postulacionService.listarPorOferta(10L).size());
    }

    @Test
    void rechazaListarOfertaInexistente() {
        when(ofertaRepository.existsById(99L)).thenReturn(false);
        assertThrows(NotFoundException.class, () -> postulacionService.listarPorOferta(99L));
    }

    @Test
    void actualizaEstadoYDescargaCv() {
        Postulacion postulacion = Postulacion.builder()
                .id(20L)
                .oferta(oferta)
                .cvDriveFileId("file-1")
                .estado(EstadoPostulacion.RECIBIDA)
                .build();
        when(postulacionRepository.findById(20L)).thenReturn(Optional.of(postulacion));
        when(postulacionRepository.save(any(Postulacion.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(googleDriveService.descargar("file-1"))
                .thenReturn(new GoogleDriveService.Archivo("cv.pdf", "application/pdf", new byte[]{1}));

        var actualizada = postulacionService.actualizarEstado(
                20L, new ActualizarEstadoPostulacionRequest("CONTRATADA"));
        assertEquals("CONTRATADA", actualizada.estado());
        assertNotNull(postulacionService.descargarCv(20L));
    }

    @Test
    void rechazaPostulacionInexistenteYSinCv() {
        when(postulacionRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class,
                () -> postulacionService.actualizarEstado(99L, new ActualizarEstadoPostulacionRequest("RECHAZADA")));

        Postulacion sinCv = Postulacion.builder().id(21L).build();
        when(postulacionRepository.findById(21L)).thenReturn(Optional.of(sinCv));
        assertThrows(NotFoundException.class, () -> postulacionService.descargarCv(21L));
    }
}
