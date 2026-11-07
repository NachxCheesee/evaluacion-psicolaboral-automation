package cl.aquachile.evalpsi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.boot.security.autoconfigure.UserDetailsServiceAutoConfiguration;

// No usamos el usuario en memoria de Spring Security: la autenticación real
// se resuelve con el filtro JWT y la tabla cuentas.
@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@ConfigurationPropertiesScan
public class AquaChileApplication {

	public static void main(String[] args) {
		SpringApplication.run(AquaChileApplication.class, args);
	}

}
