package cl.aquachile.evalpsi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class GoogleDriveProperties {

    private final String clientId;
    private final String clientSecret;
    private final String refreshToken;

    public GoogleDriveProperties(
            @Value("${GOOGLE_CLIENT_ID:}") String clientId,
            @Value("${GOOGLE_CLIENT_SECRET:}") String clientSecret,
            @Value("${GOOGLE_REFRESH_TOKEN:}") String refreshToken) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.refreshToken = refreshToken;
    }

    public boolean isConfigured() {
        return noVacio(clientId) && noVacio(clientSecret) && noVacio(refreshToken);
    }

    public String getClientId() {
        return clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    private boolean noVacio(String valor) {
        return valor != null && !valor.isBlank();
    }
}
