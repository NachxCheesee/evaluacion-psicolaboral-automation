package cl.aquachile.evalpsi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada del microservicio AquaChile.
 *
 * <p>Backend REST que centraliza el acceso a Supabase y reemplaza el login
 * simulado del frontend por autenticación con JWT (Parte 2).</p>
 */
@SpringBootApplication
public class AquaChileApplication {

	public static void main(String[] args) {
		SpringApplication.run(AquaChileApplication.class, args);
	}

}
