package com.example.QucikTurn.Security;

import com.example.QucikTurn.Repository.UserRepository;
import com.example.QucikTurn.Security.oauth2.CustomOAuth2UserService;
import com.example.QucikTurn.Security.oauth2.OAuth2AuthenticationSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public UserDetailsService userDetailsService(UserRepository repo) {
        return username -> repo.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService uds, PasswordEncoder enc) {
        DaoAuthenticationProvider p = new DaoAuthenticationProvider();
        p.setUserDetailsService(uds);
        p.setPasswordEncoder(enc);
        return p;
    }

    /**
     * SECURITY FIX P2: Restricted CORS to specific production domains only.
     * Wildcard origins are dangerous when combined with allowCredentials=true.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // SECURITY: Only allow specific trusted origins
        configuration.setAllowedOrigins(Arrays.asList(
                "https://quick-turn.vercel.app",
                "https://quickturn.web.id",
                "https://www.quickturn.web.id",
                "http://localhost:3000", // Local development
                "http://localhost:5173", // Vite local development
                "http://localhost" // Docker production local
        ));

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // Cache preflight for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
            JwtAuthFilter jwtAuthFilter,
            RateLimitingFilter rateLimitingFilter,
            CustomOAuth2UserService customOAuth2UserService,
            OAuth2AuthenticationSuccessHandler oAuth2SuccessHandler) throws Exception {
        http
                /*
                 * SECURITY NOTE P4: CSRF is disabled because:
                 * 1. This API uses stateless JWT authentication (no cookies/sessions)
                 * 2. JWT tokens are stored in localStorage on the client (not cookies)
                 * 3. Each request requires explicit Authorization header
                 * 
                 * If cookies are used for auth in the future, CSRF MUST be re-enabled!
                 */
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(new AntPathRequestMatcher("/api/auth/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/actuator/health")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/ws/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/ws-raw/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/uploads/**")).permitAll()

                        // --- OAUTH2 LOGIN ENDPOINTS (must be permitAll) ---
                        .requestMatchers(new AntPathRequestMatcher("/oauth2/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/login/oauth2/**")).permitAll()

                        // --- ADMIN & ANNOUNCEMENTS ---
                        .requestMatchers(new AntPathRequestMatcher("/api/admin/**"))
                        .hasAnyAuthority("ROLE_ADMIN", "ADMIN")
                        .requestMatchers(new AntPathRequestMatcher("/api/reports/admin/**"))
                        .hasAnyAuthority("ROLE_ADMIN", "ADMIN")
                        .requestMatchers(new AntPathRequestMatcher("/api/announcements", "GET")).authenticated()
                        .requestMatchers(new AntPathRequestMatcher("/api/announcements/**"))
                        .hasAnyAuthority("ROLE_ADMIN", "ADMIN")

                        // Block everything else
                        .anyRequest().authenticated())
                .httpBasic(basic -> basic.disable())

                // --- OAUTH2 LOGIN CONFIGURATION ---
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService))
                        .successHandler(oAuth2SuccessHandler));

        // SECURITY FIX P1: Add rate limiting filter BEFORE authentication
        http.addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
