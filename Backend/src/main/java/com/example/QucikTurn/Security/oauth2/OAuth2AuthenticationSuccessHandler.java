package com.example.QucikTurn.Security.oauth2;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.AccountStatus;
import com.example.QucikTurn.Entity.enums.Role;
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
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Custom Success Handler for OAuth2 Login.
 * After successful Google login, this handler:
 * 1. Creates or updates the user in the database.
 * 2. Generates a JWT token for the authenticated user.
 * 3. Redirects to the frontend with the token as a URL parameter.
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
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String pictureUrl = oAuth2User.getAttribute("picture");

        // Find or create user
        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;
        boolean isNewUser = false;

        if (existingUser.isPresent()) {
            // Existing user - update last login
            user = existingUser.get();
            user.setLastLoginAt(LocalDateTime.now());

            // Update profile picture if not set
            if (user.getProfilePictureUrl() == null || user.getProfilePictureUrl().isEmpty()) {
                user.setProfilePictureUrl(pictureUrl);
            }
        } else {
            // New user - create record
            isNewUser = true;
            user = new User();
            user.setEmail(email);
            user.setNama(name);
            user.setRole(Role.MAHASISWA); // Default role
            user.setProfilePictureUrl(pictureUrl);
            user.setActive(true);
            user.setAccountStatus(AccountStatus.ACTIVE);
            user.setLastLoginAt(LocalDateTime.now());

            // Generate unique username
            String baseUsername = email.split("@")[0];
            String candidate = baseUsername;
            int counter = 1;
            while (userRepository.existsByUsername(candidate)) {
                candidate = baseUsername + counter;
                counter++;
            }
            user.setUsername(candidate);

            // OAuth users don't need password
            user.setPasswordHash("OAUTH2_" + UUID.randomUUID().toString());
        }

        // Save user
        userRepository.saveAndFlush(user);

        // Generate JWT token
        Map<String, Object> claims = Map.of(
                "id", user.getId(),
                "role", user.getRole().name(),
                "nama", user.getNama());
        String jwtToken = jwtService.generateToken(user.getEmail(), claims);

        // Redirect to frontend with token and isNewUser flag
        String redirectUrl = frontendUrl + "/oauth2/callback?token=" + jwtToken + "&isNewUser=" + isNewUser;

        response.sendRedirect(redirectUrl);
    }
}
