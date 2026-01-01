package com.example.QucikTurn.Security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * SECURITY: Rate Limiting Filter for Brute Force Protection
 * 
 * Limits requests per IP address to prevent:
 * - Brute force login attacks
 * - Password reset abuse
 * - API abuse
 */
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    // In-memory bucket storage (for production, use Redis)
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    // Stricter limits for auth endpoints
    private static final int AUTH_REQUESTS_PER_MINUTE = 10;
    private static final int GENERAL_REQUESTS_PER_MINUTE = 100;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String clientIp = getClientIP(request);
        String path = request.getRequestURI();

        // Determine rate limit based on endpoint
        Bucket bucket;
        if (isAuthEndpoint(path)) {
            bucket = getAuthBucket(clientIp);
        } else {
            bucket = getGeneralBucket(clientIp);
        }

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"Too many requests. Please try again later.\",\"data\":null}");
        }
    }

    private boolean isAuthEndpoint(String path) {
        return path.startsWith("/api/auth/login") ||
                path.startsWith("/api/auth/forgot-password") ||
                path.startsWith("/api/auth/reset-password") ||
                path.startsWith("/api/auth/verify-reset-code");
    }

    private Bucket getAuthBucket(String ip) {
        return buckets.computeIfAbsent("auth:" + ip, k -> Bucket.builder()
                .addLimit(Bandwidth.simple(AUTH_REQUESTS_PER_MINUTE, Duration.ofMinutes(1)))
                .build());
    }

    private Bucket getGeneralBucket(String ip) {
        return buckets.computeIfAbsent("general:" + ip, k -> Bucket.builder()
                .addLimit(Bandwidth.simple(GENERAL_REQUESTS_PER_MINUTE, Duration.ofMinutes(1)))
                .build());
    }

    private String getClientIP(HttpServletRequest request) {
        // Check for proxy headers first
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Take the first IP if multiple are present
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getRequestURI();
        // Skip rate limiting for static resources and health checks
        return path.startsWith("/actuator/health") ||
                path.startsWith("/ws") ||
                path.startsWith("/uploads");
    }
}
