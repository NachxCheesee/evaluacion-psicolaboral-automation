package cl.aquachile.evalpsi.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.aquachile.evalpsi.config.JwtProperties;
import cl.aquachile.evalpsi.dto.auth.LoginRequest;
import cl.aquachile.evalpsi.dto.auth.LoginResponse;
import cl.aquachile.evalpsi.dto.auth.RefreshTokenRequest;
import cl.aquachile.evalpsi.dto.usuario.UsuarioResponse;
import cl.aquachile.evalpsi.exception.UnauthorizedException;
import cl.aquachile.evalpsi.mapper.CuentaMapper;
import cl.aquachile.evalpsi.model.Cuenta;
import cl.aquachile.evalpsi.model.RefreshToken;
import cl.aquachile.evalpsi.repository.CuentaRepository;
import cl.aquachile.evalpsi.repository.RefreshTokenRepository;
import cl.aquachile.evalpsi.security.JwtService;

@Service
public class AuthService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final CuentaRepository cuentaRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;

    public AuthService(CuentaRepository cuentaRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       JwtProperties jwtProperties) {
        this.cuentaRepository = cuentaRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String correo = request.correo().trim();

        Cuenta cuenta = cuentaRepository.findByCorreoIgnoreCase(correo)
                .orElseThrow(() -> new UnauthorizedException("Credenciales incorrectas."));

        boolean credencialesValidas = validarPassword(cuenta, request.password());

        if (!credencialesValidas) {
            throw new UnauthorizedException("Credenciales incorrectas.");
        }

        // Limpieza oportunista de tokens vencidos.
        refreshTokenRepository.eliminarExpirados(Instant.now().minus(1, ChronoUnit.DAYS));

        return emitirTokens(cuenta);
    }

    @Transactional
    public LoginResponse refresh(RefreshTokenRequest request) {
        String hash = hashToken(request.refreshToken());

        RefreshToken refreshToken = refreshTokenRepository.findByTokenHashAndRevocadoFalse(hash)
                .orElseThrow(() -> new UnauthorizedException("Refresh token inválido o revocado."));

        if (refreshToken.getExpiraEn().isBefore(Instant.now())) {
            refreshToken.setRevocado(true);
            refreshTokenRepository.save(refreshToken);
            throw new UnauthorizedException("El refresh token expiró. Inicia sesión nuevamente.");
        }

        // Rotación: el token usado se invalida y se entrega uno nuevo.
        refreshToken.setRevocado(true);
        refreshTokenRepository.save(refreshToken);

        return emitirTokens(refreshToken.getCuenta());
    }

    @Transactional
    public void logout(RefreshTokenRequest request) {
        String hash = hashToken(request.refreshToken());
        refreshTokenRepository.findByTokenHashAndRevocadoFalse(hash).ifPresent(token -> {
            token.setRevocado(true);
            refreshTokenRepository.save(token);
        });
    }

    @Transactional(readOnly = true)
    public UsuarioResponse usuarioActual(String correo) {
        Cuenta cuenta = cuentaRepository.findByCorreoIgnoreCase(correo)
                .orElseThrow(() -> new UnauthorizedException("La cuenta ya no existe."));
        return CuentaMapper.toResponse(cuenta);
    }

    private boolean validarPassword(Cuenta cuenta, String passwordPlano) {
        String hash = cuenta.getPasswordHash();

        // Camino normal: validar contra el hash BCrypt.
        if (hash != null && !hash.isBlank() && passwordEncoder.matches(passwordPlano, hash)) {
            return true;
        }

        // Compatibilidad temporal con el frontend antiguo, que todavía puede
        // cambiar la columna password directamente en Supabase. Si el texto
        // plano coincide, aceptamos el login y actualizamos el hash.
        if (cuenta.getPassword() == null) {
            return false;
        }

        boolean coincide = MessageDigest.isEqual(
                passwordPlano.getBytes(StandardCharsets.UTF_8),
                cuenta.getPassword().getBytes(StandardCharsets.UTF_8)
        );

        if (coincide) {
            cuenta.setPasswordHash(passwordEncoder.encode(passwordPlano));
            cuentaRepository.save(cuenta);
        }
        return coincide;
    }

    private LoginResponse emitirTokens(Cuenta cuenta) {
        String accessToken = jwtService.generarAccessToken(cuenta);
        String refreshTokenPlano = generarRefreshToken();

        RefreshToken entidad = RefreshToken.builder()
                .cuenta(cuenta)
                .tokenHash(hashToken(refreshTokenPlano))
                .expiraEn(Instant.now().plus(jwtProperties.refreshTokenDays(), ChronoUnit.DAYS))
                .revocado(false)
                .creadoEn(Instant.now())
                .build();
        refreshTokenRepository.save(entidad);

        return LoginResponse.bearer(
                accessToken,
                refreshTokenPlano,
                jwtService.getExpiresInSeconds(),
                CuentaMapper.toResponse(cuenta)
        );
    }

    private String generarRefreshToken() {
        byte[] bytes = new byte[48];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 no está disponible", ex);
        }
    }
}
