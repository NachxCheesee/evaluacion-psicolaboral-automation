package cl.aquachile.evalpsi.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;

import cl.aquachile.evalpsi.config.ResendProperties;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final ResendProperties properties;
    private Resend resend;

    public EmailService(ResendProperties properties) {
        this.properties = properties;
    }

    @Async
    public void confirmacionPostulacion(String correo, String candidato, String cargo) {
        if (correo == null || correo.isBlank()) {
            return;
        }
        String asunto = "Tu postulación fue recibida";
        String html = "<h2>Hola " + escapar(candidato) + "</h2>"
                + "<p>Recibimos tu postulación al cargo <strong>" + escapar(cargo) + "</strong>.</p>"
                + "<p>Te contactaremos pronto.</p>";
        enviar(correo, asunto, html);
    }

    @Async
    public void cambioEstado(String correo, String candidato, String estado) {
        if (correo == null || correo.isBlank()) {
            return;
        }
        String asunto = "Actualización de tu postulación";
        String html = "<h2>Hola " + escapar(candidato) + "</h2>"
                + "<p>Tu postulación cambió de estado a <strong>" + escapar(estado) + "</strong>.</p>";
        enviar(correo, asunto, html);
    }

    @Async
    public void bienvenida(String correo, String nombre, String rol) {
        if (correo == null || correo.isBlank()) {
            return;
        }
        String asunto = "Tu cuenta fue creada";
        String html = "<h2>Hola " + escapar(nombre) + "</h2>"
                + "<p>Se creó tu cuenta con el rol <strong>" + escapar(rol) + "</strong>.</p>";
        enviar(correo, asunto, html);
    }

    private void enviar(String para, String asunto, String html) {
        if (!properties.isConfigured()) {
            log.warn("Resend no está configurado; se omite el correo a {}", para);
            return;
        }
        try {
            CreateEmailOptions opciones = CreateEmailOptions.builder()
                    .from(properties.getFrom())
                    .to(para)
                    .subject(asunto)
                    .html(html)
                    .build();
            resend().emails().send(opciones);
            log.info("Correo enviado a {}", para);
        } catch (Exception ex) {
            log.error("No se pudo enviar el correo a {}: {}", para, ex.getMessage());
        }
    }

    private Resend resend() {
        if (resend == null) {
            resend = new Resend(properties.getApiKey());
        }
        return resend;
    }

    private String escapar(String valor) {
        if (valor == null) {
            return "";
        }
        return valor.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
