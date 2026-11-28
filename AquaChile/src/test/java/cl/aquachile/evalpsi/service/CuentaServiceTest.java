package cl.aquachile.evalpsi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;

import cl.aquachile.evalpsi.dto.usuario.ActualizarUsuarioRequest;
import cl.aquachile.evalpsi.dto.usuario.CrearUsuarioRequest;
import cl.aquachile.evalpsi.enums.Rol;
import cl.aquachile.evalpsi.exception.BadRequestException;
import cl.aquachile.evalpsi.exception.ConflictException;
import cl.aquachile.evalpsi.exception.NotFoundException;
import cl.aquachile.evalpsi.model.Cuenta;
import cl.aquachile.evalpsi.repository.CuentaRepository;

@ExtendWith(MockitoExtension.class)
class CuentaServiceTest {

    @Mock
    private CuentaRepository cuentaRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    private CuentaService cuentaService;
    private Cuenta cuenta;

    @BeforeEach
    void setUp() {
        cuentaService = new CuentaService(cuentaRepository, passwordEncoder, emailService);
        cuenta = Cuenta.builder()
                .id(1L)
                .correo("admin@aquachile.cl")
                .nombre("Admin")
                .rol(Rol.ADMIN)
                .tituloRol("Administrador")
                .build();
    }

    @Test
    void listaCuentas() {
        when(cuentaRepository.findAll(any(Sort.class))).thenReturn(List.of(cuenta));
        assertEquals(1, cuentaService.listar().size());
    }

    @Test
    void creaCuentaYRechazaCorreoDuplicado() {
        when(cuentaRepository.existsByCorreoIgnoreCase("nuevo@aquachile.cl")).thenReturn(false);
        when(passwordEncoder.encode("123")).thenReturn("hash");
        when(cuentaRepository.save(any(Cuenta.class))).thenAnswer(invocation -> {
            Cuenta c = invocation.getArgument(0);
            c.setId(2L);
            return c;
        });

        var response = cuentaService.crear(new CrearUsuarioRequest(
                " Nuevo@Aquachile.cl ", "123", "Nuevo", Rol.ANALISTA, null));

        assertEquals("nuevo@aquachile.cl", response.correo());
        assertEquals("Analista de Reclutamiento", response.tituloRol());
        verify(emailService).bienvenida(anyString(), anyString(), anyString());

        when(cuentaRepository.existsByCorreoIgnoreCase("admin@aquachile.cl")).thenReturn(true);
        assertThrows(ConflictException.class, () -> cuentaService.crear(new CrearUsuarioRequest(
                "admin@aquachile.cl", "123", "Admin", Rol.ADMIN, null)));
    }

    @Test
    void actualizaCuentaConYsinPassword() {
        when(cuentaRepository.findById(1L)).thenReturn(Optional.of(cuenta));
        when(cuentaRepository.findByCorreoIgnoreCase("admin@aquachile.cl")).thenReturn(Optional.of(cuenta));
        when(cuentaRepository.save(any(Cuenta.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var sinPassword = cuentaService.actualizar(1L, new ActualizarUsuarioRequest(
                "admin@aquachile.cl", " ", "Admin 2", Rol.ADMIN, "Jefe"));
        assertEquals("Jefe", sinPassword.tituloRol());
        verify(passwordEncoder, never()).encode(anyString());

        when(passwordEncoder.encode("nueva")).thenReturn("hash-nuevo");
        cuentaService.actualizar(1L, new ActualizarUsuarioRequest(
                "admin@aquachile.cl", "nueva", "Admin 2", Rol.ADMIN, null));
        assertEquals("hash-nuevo", cuenta.getPasswordHash());
    }

    @Test
    void rechazaActualizarConCorreoDeOtraCuenta() {
        Cuenta otra = Cuenta.builder().id(2L).correo("otra@aquachile.cl").build();
        when(cuentaRepository.findById(1L)).thenReturn(Optional.of(cuenta));
        when(cuentaRepository.findByCorreoIgnoreCase("otra@aquachile.cl")).thenReturn(Optional.of(otra));

        assertThrows(ConflictException.class, () -> cuentaService.actualizar(1L,
                new ActualizarUsuarioRequest("otra@aquachile.cl", null, "Admin", Rol.ADMIN, null)));
    }

    @Test
    void eliminaCuentaYRechazaAutoEliminacion() {
        when(cuentaRepository.findById(1L)).thenReturn(Optional.of(cuenta));

        assertThrows(BadRequestException.class, () -> cuentaService.eliminar(1L, "ADMIN@AQUACHILE.CL"));

        cuentaService.eliminar(1L, "otro@aquachile.cl");
        verify(cuentaRepository).delete(cuenta);
    }

    @Test
    void rechazaCuentaInexistente() {
        when(cuentaRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> cuentaService.eliminar(99L, "admin@aquachile.cl"));
    }

    @Test
    void usaTitulosPorDefecto() {
        when(cuentaRepository.existsByCorreoIgnoreCase(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hash");
        when(cuentaRepository.save(any(Cuenta.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertEquals("Administrador de Sistemas", cuentaService.crear(
                new CrearUsuarioRequest("a@aquachile.cl", "123", "A", Rol.ADMIN, null)).tituloRol());
        assertEquals("Profesional Evaluador", cuentaService.crear(
                new CrearUsuarioRequest("b@aquachile.cl", "123", "B", Rol.EVALUADOR, null)).tituloRol());
    }
}
