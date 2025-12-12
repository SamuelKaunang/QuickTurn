package com.example.QucikTurn.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwt;
    private final UserDetailsService uds;

    public JwtAuthFilter(JwtService jwt, UserDetailsService uds){
        this.jwt=jwt;
        this.uds=uds;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        String h = req.getHeader(HttpHeaders.AUTHORIZATION);
        if (h == null || !h.startsWith("Bearer ")) {
            chain.doFilter(req, res);
            return;
        }

        String token = h.substring(7);
        try {
            String username = jwt.username(token);

            // Cek log username hasil extract
            System.out.println("DEBUG JWT Filter - Username from token: " + username);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null){
                var user = uds.loadUserByUsername(username);

                // Cek apakah validasi berhasil
                boolean isValid = jwt.valid(token, user.getUsername());
                System.out.println("DEBUG JWT Filter - Is Valid? " + isValid);

                if (isValid){
                    var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                    System.out.println("DEBUG JWT Filter - Authentication Set Success!");
                }
            }
        } catch (Exception e) {
            // 🔥 JANGAN DI-IGNORE! Print error-nya biar ketahuan
            System.out.println("DEBUG JWT Filter - ERROR: " + e.getMessage());
            e.printStackTrace();
        }
        chain.doFilter(req, res);
    }
}