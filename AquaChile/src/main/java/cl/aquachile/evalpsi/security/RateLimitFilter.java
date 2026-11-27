package cl.aquachile.evalpsi.security;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;

import cl.aquachile.evalpsi.config.RateLimitProperties;
import cl.aquachile.evalpsi.dto.ApiError;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitProperties properties;
    private final ObjectMapper objectMapper;
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public RateLimitFilter(RateLimitProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String uri = request.getRequestURI();
        if (uri != null && (uri.startsWith("/api/health") || uri.startsWith("/actuator"))) {
            filterChain.doFilter(request, response);
            return;
        }

        String ip = request.getRemoteAddr();
        Bucket bucket = buckets.computeIfAbsent(ip, clave -> crearBucket());

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
            return;
        }

        response.setStatus(429);
        response.setContentType("application/json");
        ApiError error = new ApiError(
                429,
                "Too Many Requests",
                "Demasiadas peticiones desde tu IP. Inténtalo más tarde.",
                request.getRequestURI()
        );
        objectMapper.writeValue(response.getWriter(), error);
    }

    private Bucket crearBucket() {
        long maximo = properties.getMaxPorDia();
        Bandwidth limite = Bandwidth.classic(maximo, Refill.greedy(maximo, Duration.ofDays(1)));
        return Bucket.builder().addLimit(limite).build();
    }
}
