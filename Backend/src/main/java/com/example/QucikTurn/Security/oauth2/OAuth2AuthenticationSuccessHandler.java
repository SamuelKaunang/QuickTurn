package com.example.QucikTurn.Security.oauth2;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Security.JwtService;
import com.example.QucikTurn.Service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

/**
 * Custom Success Handler for OAuth2 Login.
 * After successful Google login, this handler:
 * 1. Delegates user creation/update transactionally to UserService.
 * 2. Generates a JWT token for the authenticated user.
 * 3. Redirects to the frontend with the token as a URL parameter.
 * 
 * Note: @Transactional is intentionally NOT used on this handler method
 * to ensure database connections are released immediately before executing
 * network-bound operations (like response.sendRedirect).
 */
@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserService userService;
    private final JwtService jwtService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public OAuth2AuthenticationSuccessHandler(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String pictureUrl = oAuth2User.getAttribute("picture");

        // Delegate database operations to UserService inside a short-lived transaction
        UserService.OAuth2UserProcessingResult result = userService.processOAuthPostLogin(email, name, pictureUrl);
        User user = result.user();
        boolean isNewUser = result.isNewUser();

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
