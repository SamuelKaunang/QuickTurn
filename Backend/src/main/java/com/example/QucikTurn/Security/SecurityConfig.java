package com.example.QucikTurn.Security;

import com.example.QucikTurn.Repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import java.util.Arrays;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    // ⛔ TIDAK ADA field JwtAuthFilter / constructor di sini!

    @Bean
    public UserDetailsService userDetailsService(UserRepository repo) {
        return username -> repo.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService uds, PasswordEncoder enc) {
        DaoAuthenticationProvider p = new DaoAuthenticationProvider();
        p.setUserDetailsService(uds);
        p.setPasswordEncoder(enc);
        return p;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Izinkan asal request (Frontend React kamu)
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));

        // Izinkan method HTTP (GET, POST, dll)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Izinkan semua header (Authorization, Content-Type, dll)
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // Izinkan kredensial (cookies/auth headers)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Terapkan ke semua URL
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }

    // ✅ Inject JwtAuthFilter HANYA sebagai parameter method bean
// ✅ Inject JwtAuthFilter tetap sebagai parameter
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        http
                // 1. CSRF Disable (Sudah ada punya kamu)
                .csrf(csrf -> csrf.disable())

                // 2. TAMBAHAN PENTING: Aktifkan CORS di sini!
                // Ini akan memanggil method corsConfigurationSource() di bawah
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 3. Session Management (Punya kamu)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // SETELAH (Copy-Paste gantiin bagian auth -> auth)
                .authorizeHttpRequests(auth -> auth
                        // 1. Endpoint yang WAJIB DIIZINKAN (Tanpa Token)
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/forgot-password", // WAJIB
                                "/api/auth/reset-password",  // WAJIB
                                "/actuator/health"
                        )
                        .permitAll() // <--- Bikin semua list di atas PURE PUBLIC

                        // 2. Semua request lain (misal: /api/auth/profile atau /api/data)
                        .anyRequest().authenticated()
                )
                //
                .httpBasic(Customizer.withDefaults());

        // 5. Filter JWT (Punya kamu)
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
