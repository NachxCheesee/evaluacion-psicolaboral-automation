package cl.aquachile.evalpsi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import cl.aquachile.evalpsi.dto.solicitud.ActualizarEvaluacionRequest;
import cl.aquachile.evalpsi.dto.solicitud.EvaluacionDto;
import cl.aquachile.evalpsi.dto.solicitud.SolicitudRequest;
import cl.aquachile.evalpsi.enums.EstadoSolicitud;
import cl.aquachile.evalpsi.exception.NotFoundException;
import cl.aquachile.evalpsi.exception.PostulacionesExcedidasException;
import cl.aquachile.evalpsi.model.Evaluacion;
import cl.aquachile.evalpsi.model.Oferta;
import cl.aquachile.evalpsi.model.Postulante;
import cl.aquachile.evalpsi.model.Solicitud;
import cl.aquachile.evalpsi.repository.SolicitudRepository;

@ExtendWith(MockitoExtension.class)
class SolicitudServiceTest {

    @Mock
    private SolicitudRepository solicitudRepository;

    @Mock
    private GoogleDriveService googleDriveService;

    @Mock
    private EmailService emailService;

    @Mock
    private CvValidator cvValidator;

    @InjectMocks
    private SolicitudService solicitudService;

    private Solicitud solicitud;
    private SolicitudRequest request;

    @BeforeEach
    void setUp() {
        solicitud = Solicitud.builder()
                .id(1L)
                .rut("12345678-9")
                .candidato("Juan Pérez")
                .correo("juan@example.com")
                .cargo("Operario")
                .fechaSolicitud(LocalDate.now())
                .estado(EstadoSolicitud.PENDIENTE)
                .evaluacion(Evaluacion.vacia())
                .build();

        request = new SolicitudRequest(
                "12345678-9", "Juan Pérez", "juan@example.com", "+56912345678",
                "Puerto Montt", "Operario", "Operario Calificado", LocalDate.now(),
                "Portal", "Responsable", "cv.pdf", "Pendiente", "Obs", EvaluacionDto.vacia());
    }

    @AfterEach
    void limpiarSeguridad() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void listaConFiltrosYOrden() {
        when(solicitudRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(solicitud)));

        var respuesta = solicitudService.listar("juan", "Pendiente", -1, 1000, "cargo", "asc");

        assertEquals(1, respuesta.content().size());
        assertEquals("Juan Pérez", respuesta.content().get(0).candidato());
    }

    @Test
    void obtieneSolicitudExistenteEInexistente() {
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitud));
        assertEquals(1L, solicitudService.obtener(1L).id());

        when(solicitudRepository.findById(2L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> solicitudService.obtener(2L));
    }

    @Test
    void creaSolicitudYValidaLimite() {
        when(solicitudRepository.countByRutAndCreatedAtAfter(anyString(), any())).thenReturn(0L);
        when(solicitudRepository.save(any(Solicitud.class))).thenReturn(solicitud);

        var creada = solicitudService.crear(request);

        assertEquals(1L, creada.id());
        verify(emailService).confirmacionPostulacion(anyString(), anyString(), anyString());

        when(solicitudRepository.countByRutAndCreatedAtAfter(anyString(), any())).thenReturn(3L);
        assertThrows(PostulacionesExcedidasException.class, () -> solicitudService.crear(request));
    }

    @Test
    void creaDesdePostulacionYPermiteRutVacio() {
        Postulante postulante = Postulante.builder()
                .rut("12345678-9")
                .nombre("Juan Pérez")
                .correo("juan@example.com")
                .telefono("+56912345678")
                .build();
        Oferta oferta = Oferta.builder()
                .id(1L)
                .cargo("Operario")
                .categoria("Operario Calificado")
                .build();
        when(solicitudRepository.countByRutAndCreatedAtAfter(anyString(), any())).thenReturn(0L);
        when(solicitudRepository.save(any(Solicitud.class))).thenAnswer(invocation -> {
            Solicitud s = invocation.getArgument(0);
            s.setId(7L);
            return s;
        });

        var creada = solicitudService.crearDesdePostulacion(
                postulante, oferta, "cv.pdf", "file-1", "Postulación");
        assertEquals(7L, creada.getId());
        assertEquals("file-1", creada.getCvDriveFileId());

        Postulante sinRut = Postulante.builder().rut(null).build();
        when(solicitudRepository.save(any(Solicitud.class))).thenReturn(solicitud);
        assertNotNull(solicitudService.crearDesdePostulacion(sinRut, oferta, "cv.pdf", "file", "obs"));
    }

    @Test
    void actualizaSolicitudEvaluacionYElimina() {
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitud));
        when(solicitudRepository.save(any(Solicitud.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertEquals("Juan Pérez", solicitudService.actualizar(1L, request).candidato());

        var evaluada = solicitudService.actualizarEvaluacion(1L,
                new ActualizarEvaluacionRequest("Finalizada",
                        new EvaluacionDto("2026-11-01", "Recomendable", "Ok", "", "")));
        assertEquals("Finalizada", evaluada.estado());
        verify(emailService).cambioEstado(anyString(), anyString(), anyString());

        solicitudService.eliminar(1L);
        verify(solicitudRepository).delete(solicitud);
    }

    @Test
    void subeYDescargaCv() {
        MockMultipartFile archivo = new MockMultipartFile(
                "cv", "cv.pdf", "application/pdf", new byte[]{0x25, 0x50, 0x44, 0x46});
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitud));
        when(cvValidator.nombreArchivo(archivo)).thenReturn("cv.pdf");
        when(googleDriveService.obtenerOCrearCarpetaRaiz()).thenReturn("root");
        when(googleDriveService.obtenerOCrearCarpetaCandidato(anyString(), anyString(), anyString()))
                .thenReturn("folder");
        when(googleDriveService.subir(anyString(), anyString(), anyString(), any(byte[].class)))
                .thenReturn("file-1");
        when(solicitudRepository.save(any(Solicitud.class))).thenReturn(solicitud);

        assertNotNull(solicitudService.subirCv(1L, archivo));
        assertEquals("file-1", solicitud.getCvDriveFileId());

        when(googleDriveService.descargar("file-1"))
                .thenReturn(new GoogleDriveService.Archivo("cv.pdf", "application/pdf", new byte[]{1}));
        assertNotNull(solicitudService.descargarCv(1L));
    }

    @Test
    void rechazaDescargaSinCvYReemplazoDeAnalista() {
        when(solicitudRepository.findById(1L)).thenReturn(Optional.of(solicitud));
        assertThrows(NotFoundException.class, () -> solicitudService.descargarCv(1L));

        solicitud.setCvDriveFileId("existente");
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "analista", null, List.of(new SimpleGrantedAuthority("ROLE_ANALISTA")));
        SecurityContextHolder.getContext().setAuthentication(auth);

        MockMultipartFile archivo = new MockMultipartFile(
                "cv", "cv.pdf", "application/pdf", new byte[]{0x25, 0x50, 0x44, 0x46});
        assertThrows(org.springframework.security.access.AccessDeniedException.class,
                () -> solicitudService.subirCv(1L, archivo));
    }
}
