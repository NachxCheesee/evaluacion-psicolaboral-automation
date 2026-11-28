package cl.aquachile.evalpsi.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.atLeast;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import cl.aquachile.evalpsi.config.JwtProperties;
import cl.aquachile.evalpsi.dto.auth.LoginRequest;
import cl.aquachile.evalpsi.dto.auth.RefreshTokenRequest;
import cl.aquachile.evalpsi.enums.Rol;
import cl.aquachile.evalpsi.exception.UnauthorizedException;
import cl.aquachile.evalpsi.model.Cuenta;
import cl.aquachile.evalpsi.model.RefreshToken;
import cl.aquachile.evalpsi.repository.CuentaRepository;
import cl.aquachile.evalpsi.repository.RefreshTokenRepository;
import cl.aquachile.evalpsi.security.JwtService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private CuentaRepository cuentaRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private Cuenta cuenta;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                cuentaRepository,
                refreshTokenRepository,
                passwordEncoder,
                jwtService,
                new JwtProperties("secreto-de-prueba-con-mas-de-32-caracteres", 30, 7)
        );

        cuenta = Cuenta.builder()
                .id(1L)
                .correo("admin@aquachile.cl")
                .nombre("Admin")
                .passwordHash("hash")
                .rol(Rol.ADMIN)
                .build();

        lenient().when(jwtService.generarAccessToken(any())).thenReturn("access");
        lenient().when(jwtService.getExpiresInSeconds()).thenReturn(1800L);
    }

    @Test
    void loginConHashValido() {
        when(cuentaRepository.findByCorreoIgnoreCase("admin@aquachile.cl")).thenReturn(Optional.of(cuenta));
        when(passwordEncoder.matches("123", "hash")).thenReturn(true);

        var response = authService.login(new LoginRequest("admin@aquachile.cl", "123"));

        assertEquals("access", response.accessToken());
        assertEquals("admin@aquachile.cl", response.usuario().correo());
    }

    @Test
    void loginMigraPasswordPlano() {
        cuenta.setPasswordHash(null);
        cuenta.setPassword("123");
        when(cuentaRepository.findByCorreoIgnoreCase("admin@aquachile.cl")).thenReturn(Optional.of(cuenta));
        when(passwordEncoder.encode("123")).thenReturn("nuevo-hash");
        when(cuentaRepository.save(any(Cuenta.class))).thenReturn(cuenta);

        var response = authService.login(new LoginRequest("admin@aquachile.cl", "123"));

        assertNotNull(response.accessToken());
        assertEquals("nuevo-hash", cuenta.getPasswordHash());
    }

    @Test
    void loginRechazaCredencialesInvalidas() {
        when(cuentaRepository.findByCorreoIgnoreCase(anyString())).thenReturn(Optional.of(cuenta));
        when(passwordEncoder.matches("mala", "hash")).thenReturn(false);

        assertThrows(UnauthorizedException.class,
                () -> authService.login(new LoginRequest("admin@aquachile.cl", "mala")));

        when(cuentaRepository.findByCorreoIgnoreCase(anyString())).thenReturn(Optional.empty());
        assertThrows(UnauthorizedException.class,
                () -> authService.login(new LoginRequest("nadie@aquachile.cl", "123")));
    }

    @Test
    void refreshValidoRotaToken() {
        RefreshToken token = RefreshToken.builder()
                .cuenta(cuenta)
                .expiraEn(Instant.now().plus(1, ChronoUnit.DAYS))
                .revocado(false)
                .build();
        when(refreshTokenRepository.findByTokenHashAndRevocadoFalse(anyString())).thenReturn(Optional.of(token));

        var response = authService.refresh(new RefreshTokenRequest("refresh"));

        assertEquals("access", response.accessToken());
        verify(refreshTokenRepository, atLeast(2)).save(any(RefreshToken.class));
    }

    @Test
    void refreshExpiradoYRevocado() {
        RefreshToken expirado = RefreshToken.builder()
                .cuenta(cuenta)
                .expiraEn(Instant.now().minus(1, ChronoUnit.DAYS))
                .revocado(false)
                .build();
        when(refreshTokenRepository.findByTokenHashAndRevocadoFalse(anyString())).thenReturn(Optional.of(expirado));

        assertThrows(UnauthorizedException.class,
                () -> authService.refresh(new RefreshTokenRequest("vencido")));

        when(refreshTokenRepository.findByTokenHashAndRevocadoFalse(anyString())).thenReturn(Optional.empty());
        assertThrows(UnauthorizedException.class,
                () -> authService.refresh(new RefreshTokenRequest("revocado")));
    }

    @Test
    void logoutRevocaTokenExistente() {
        RefreshToken token = RefreshToken.builder().revocado(false).build();
        when(refreshTokenRepository.findByTokenHashAndRevocadoFalse(anyString())).thenReturn(Optional.of(token));

        authService.logout(new RefreshTokenRequest("refresh"));

        verify(refreshTokenRepository).save(token);
    }

    @Test
    void usuarioActualExistenteEInexistente() {
        when(cuentaRepository.findByCorreoIgnoreCase("admin@aquachile.cl")).thenReturn(Optional.of(cuenta));
        assertEquals("Admin", authService.usuarioActual("admin@aquachile.cl").nombre());

        when(cuentaRepository.findByCorreoIgnoreCase("nadie@aquachile.cl")).thenReturn(Optional.empty());
        assertThrows(UnauthorizedException.class, () -> authService.usuarioActual("nadie@aquachile.cl"));
    }
}
