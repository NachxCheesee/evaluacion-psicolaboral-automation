package cl.aquachile.evalpsi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ResendProperties {

    private final String apiKey;
    private final String from;

    public ResendProperties(
            @Value("${RESEND_API_KEY:}") String apiKey,
            @Value("${RESEND_FROM:AquaChile <onboarding@resend.dev>}") String from) {
        this.apiKey = apiKey;
        this.from = from;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getFrom() {
        return from;
    }
}
