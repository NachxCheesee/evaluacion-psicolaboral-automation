package cl.aquachile.evalpsi.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

import cl.aquachile.evalpsi.config.JwtProperties;
import cl.aquachile.evalpsi.enums.Rol;
import cl.aquachile.evalpsi.model.Cuenta;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;

class JwtServiceTest {

    private static final String SECRET = "secreto-de-prueba-con-mas-de-32-caracteres-para-jwt";

    @Test
    void generaYParseaTokenConDatosDeCuenta() {
        JwtService jwt = new JwtService(new JwtProperties(SECRET, 30, 7));
        Cuenta cuenta = Cuenta.builder()
                .id(3L)
                .correo("evaluador@aquachile.cl")
                .nombre("Evaluador")
                .rol(Rol.EVALUADOR)
                .build();

        String token = jwt.generarAccessToken(cuenta);
        var claims = jwt.parsear(token);

        assertNotNull(token);
        assertEquals("evaluador@aquachile.cl", claims.getSubject());
        assertEquals(3L, ((Number) claims.get("uid")).longValue());
        assertEquals("EVALUADOR", claims.get("rol", String.class));
        assertEquals(1800L, jwt.getExpiresInSeconds());
    }

    @Test
    void rechazaTokenExpirado() {
        JwtService jwt = new JwtService(new JwtProperties(SECRET, -1, 7));
        Cuenta cuenta = Cuenta.builder()
                .id(1L)
                .correo("admin@aquachile.cl")
                .nombre("Admin")
                .rol(Rol.ADMIN)
                .build();

        String token = jwt.generarAccessToken(cuenta);
        assertThrows(ExpiredJwtException.class, () -> jwt.parsear(token));
    }

    @Test
    void rechazaFirmaInvalida() {
        JwtService emisor = new JwtService(new JwtProperties(SECRET, 30, 7));
        JwtService validador = new JwtService(new JwtProperties(SECRET + "-otro", 30, 7));
        Cuenta cuenta = Cuenta.builder()
                .id(1L)
                .correo("admin@aquachile.cl")
                .nombre("Admin")
                .rol(Rol.ADMIN)
                .build();

        String token = emisor.generarAccessToken(cuenta);
        assertThrows(JwtException.class, () -> validador.parsear(token));
    }

    @Test
    void exigeSecretoMinimo() {
        assertThrows(IllegalStateException.class,
                () -> new JwtService(new JwtProperties("corto", 30, 7)));
    }
}
