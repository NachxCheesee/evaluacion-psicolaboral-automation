package cl.aquachile.evalpsi.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;

import cl.aquachile.evalpsi.dto.auth.LoginRequest;
import cl.aquachile.evalpsi.dto.auth.RefreshTokenRequest;
import cl.aquachile.evalpsi.dto.postulacion.ActualizarEstadoPostulacionRequest;
import cl.aquachile.evalpsi.enums.Rol;
import cl.aquachile.evalpsi.service.AuthService;
import cl.aquachile.evalpsi.service.CuentaService;
import cl.aquachile.evalpsi.service.GoogleDriveService;
import cl.aquachile.evalpsi.service.OfertaService;
import cl.aquachile.evalpsi.service.PostulacionService;
import cl.aquachile.evalpsi.service.SolicitudService;

class ControllerDelegationTest {

    @Test
    void authControllerDelega() {
        AuthService service = mock(AuthService.class);
        AuthController controller = new AuthController(service);
        LoginRequest login = new LoginRequest("a@a.cl", "123");
        RefreshTokenRequest refresh = new RefreshTokenRequest("token");
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("a@a.cl");

        assertNull(controller.login(login));
        assertNull(controller.refresh(refresh));
        assertNull(controller.me(auth));
        controller.logout(refresh);
        assertNotNull(controller);
    }

    @Test
    void catalogoYHealthResponden() {
        CatalogoController catalogo = new CatalogoController();
        assertEquals(5, catalogo.familiasCargo().size());
        assertEquals(3, catalogo.estados().size());
        assertEquals(4, catalogo.resultados().size());
        assertEquals(3, catalogo.roles().size());
        assertEquals(Rol.ADMIN.name(), catalogo.roles().get(0));

        HealthController health = new HealthController();
        assertEquals("UP", health.health().getBody().status());
    }

    @Test
    void solicitudControllerDelega() {
        SolicitudService service = mock(SolicitudService.class);
        SolicitudController controller = new SolicitudController(service);
        GoogleDriveService.Archivo archivo = new GoogleDriveService.Archivo(
                "cv.pdf", "application/pdf", new byte[]{1});
        when(service.descargarCv(1L)).thenReturn(archivo);

        assertNull(controller.listar(null, null, 0, 10, "id", "asc"));
        assertNull(controller.obtener(1L));
        assertNull(controller.crear(null));
        assertNull(controller.actualizar(1L, null));
        assertNull(controller.actualizarEvaluacion(1L, null));
        controller.eliminar(1L);
        assertNull(controller.subirCv(1L, null));
        assertEquals(200, controller.descargarCv(1L).getStatusCode().value());
    }

    @Test
    void ofertaControllersDelegan() {
        OfertaService ofertaService = mock(OfertaService.class);
        PostulacionService postulacionService = mock(PostulacionService.class);
        OfertaController admin = new OfertaController(ofertaService, postulacionService);
        OfertaPublicaController publico = new OfertaPublicaController(ofertaService, postulacionService);
        assertNotNull(admin.listar("x"));
        assertNull(admin.obtener(1L));
        assertNull(admin.crear(null));
        assertNull(admin.actualizar(1L, null));
        assertNull(admin.publicar(1L));
        assertNull(admin.despublicar(1L));
        admin.eliminar(1L);
        assertNotNull(admin.postulaciones(1L));
        assertNotNull(publico.listar(null));
        assertNull(publico.obtener(1L));
        assertNull(publico.postular(1L, null, null));
    }

    @Test
    void postulacionYUsuarioControllersDelegan() {
        PostulacionService postulacionService = mock(PostulacionService.class);
        PostulacionController postulacionController = new PostulacionController(postulacionService);
        ActualizarEstadoPostulacionRequest estado = new ActualizarEstadoPostulacionRequest("RECIBIDA");
        GoogleDriveService.Archivo archivo = new GoogleDriveService.Archivo(
                "cv.pdf", "application/pdf", new byte[]{1});
        when(postulacionService.descargarCv(1L)).thenReturn(archivo);

        assertNull(postulacionController.actualizarEstado(1L, estado));
        assertEquals(200, postulacionController.descargarCv(1L).getStatusCode().value());

        CuentaService cuentaService = mock(CuentaService.class);
        UsuarioController usuarioController = new UsuarioController(cuentaService);
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("admin@aquachile.cl");

        assertNotNull(usuarioController.listar());
        assertNull(usuarioController.crear(null));
        assertNull(usuarioController.actualizar(1L, null));
        usuarioController.eliminar(1L, auth);
    }
}
