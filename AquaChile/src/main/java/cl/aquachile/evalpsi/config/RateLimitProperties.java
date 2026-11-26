package cl.aquachile.evalpsi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class RateLimitProperties {

    private final long maxPorDia;

    public RateLimitProperties(@Value("${RATE_LIMIT_MAX_PER_DAY:100}") long maxPorDia) {
        this.maxPorDia = maxPorDia;
    }

    public long getMaxPorDia() {
        return maxPorDia;
    }
}
