package cl.aquachile.evalpsi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuración base de seguridad.
 *
 * <p>Parte 1: dejamos públicos únicamente los endpoints de salud, documentación
 * y consola H2. El resto queda protegido, pero todavía no existe un mecanismo
 * de autenticación real.</p>
 *
 * <p>Parte 2: aquí se agregará el filtro JWT, el AuthenticationManager y las
 * reglas por rol (ADMIN, ANALISTA, EVALUADOR).</p>
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // API REST sin formularios: no usamos CSRF ni sesiones HTTP.
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/health",
                                "/actuator/health",
                                "/actuator/info",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/h2-console/**"
                        ).permitAll()
                        // TODO Parte 2: reemplazar por reglas @PreAuthorize por rol.
                        .anyRequest().authenticated()
                );

        return http.build();
    }

    /**
     * BCrypt se usará para hashear las contraseñas de la tabla {@code cuentas}
     * en la Parte 2 (hoy el frontend las guarda en texto plano).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
