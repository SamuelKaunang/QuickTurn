package com.example.QucikTurn.Security.oauth2;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Repository.UserRepository;
import com.example.QucikTurn.Security.JwtService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Custom Success Handler for OAuth2 Login.
 * After successful Google login, this handler:
 * 1. Generates a JWT token for the authenticated user.
 * 2. Redirects to the frontend with the token as a URL parameter.
 */
@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public OAuth2AuthenticationSuccessHandler(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        // Find the user in our database (should exist after CustomOAuth2UserService
        // ran)
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found after OAuth2 login"));

        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Check if user needs role selection (new OAuth user)
        boolean isNewUser = user.getRole() == null;

        // Generate JWT token with claims (same structure as your existing login)
        // For new users, role will be "PENDING" until they select
        String roleValue = isNewUser ? "PENDING" : user.getRole().name();
        Map<String, Object> claims = Map.of(
                "id", user.getId(),
                "role", roleValue,
                "nama", user.getNama());
        String jwtToken = jwtService.generateToken(user.getEmail(), claims);

        // Redirect to frontend with token and newUser flag
        // Frontend will redirect to role selection page if isNewUser=true
        String redirectUrl = frontendUrl + "/oauth2/callback?token=" + jwtToken + "&isNewUser=" + isNewUser;

        response.sendRedirect(redirectUrl);
    }
}
