package cl.aquachile.evalpsi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;

/**
 * Documentación interactiva de la API en Swagger UI:
 * http://localhost:8080/swagger-ui.html
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI aquachileOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AquaChile API")
                        .description("Microservicio de gestión de evaluaciones psicolaborales")
                        .version("1.0.0")
                        .contact(new Contact().name("Equipo Full Stack - AquaChile")))
                .components(new Components()
                        // Esquema listo para la Parte 2: botón "Authorize" con Bearer JWT.
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .name("bearerAuth")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
