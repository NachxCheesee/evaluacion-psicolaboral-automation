package cl.aquachile.evalpsi.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Deja en el log qué base de datos quedó configurada.
 *
 * <p>Sirve para detectar el error más común al ejecutar desde el IDE: si
 * IntelliJ arranca con otra carpeta de trabajo, no encuentra el archivo
 * {@code .env} y Spring cae en H2 en memoria. En ese caso el login falla
 * porque H2 no tiene las tablas de Supabase.</p>
 *
 * <p>Nunca imprime contraseñas: solo la URL JDBC y si la variable
 * {@code DB_URL} fue cargada.</p>
 */
@Component
public class DatabaseStartupLogger {

    private static final Logger log = LoggerFactory.getLogger(DatabaseStartupLogger.class);

    private final Environment environment;

    public DatabaseStartupLogger(Environment environment) {
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void registrarBaseDeDatos() {
        String url = environment.getProperty("spring.datasource.url", "");
        boolean dbUrlCargada = environment.getProperty("DB_URL") != null;

        if (url.startsWith("jdbc:h2")) {
            log.warn("Base de datos activa: H2 en memoria (DB_URL cargada: {})", dbUrlCargada);
            log.warn("Si esperabas Supabase, revisa la Working directory de IntelliJ. "
                    + "Debe ser la carpeta AquaChile o la raíz del repositorio, "
                    + "y el archivo .env debe existir.");
            return;
        }

        log.info("Base de datos activa: {} (DB_URL cargada: {})", sanitizar(url), dbUrlCargada);
    }

    /**
     * Evita que una URL con credenciales embebidas termine en los logs.
     */
    private String sanitizar(String url) {
        return url.replaceAll("(?i)(password|pwd|user)=([^&;]+)", "$1=***");
    }
}
