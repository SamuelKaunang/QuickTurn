package com.example.QucikTurn.Security.oauth2;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.AccountStatus;
import com.example.QucikTurn.Entity.enums.Role;
import com.example.QucikTurn.Repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Custom OAuth2 User Service for Google Login.
 * This service handles the logic of syncing Google profile data
 * with our existing User entity.
 */
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        // Extract Google profile data
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String pictureUrl = (String) attributes.get("picture");

        // Check if user already exists in our database
        Optional<User> existingUser = userRepository.findByEmail(email);

        if (existingUser.isPresent()) {
            // User exists - update last login time
            User user = existingUser.get();
            user.setLastLoginAt(LocalDateTime.now());

            // Optionally update profile picture if not set
            if (user.getProfilePictureUrl() == null || user.getProfilePictureUrl().isEmpty()) {
                user.setProfilePictureUrl(pictureUrl);
            }

            userRepository.save(user);
        } else {
            // New user - create a new record with NO ROLE (null)
            // User will be asked to select their role after first login
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setNama(name);
            newUser.setRole(null); // NULL = needs role selection!
            newUser.setProfilePictureUrl(pictureUrl);
            newUser.setActive(true);
            newUser.setAccountStatus(AccountStatus.ACTIVE);
            newUser.setLastLoginAt(LocalDateTime.now());

            // Generate a unique username from email
            String baseUsername = email.split("@")[0];
            String uniqueUsername = generateUniqueUsername(baseUsername);
            newUser.setUsername(uniqueUsername);

            // OAuth users don't need a password, but field is NOT NULL.
            // Set a random hash that cannot be used for login.
            newUser.setPasswordHash("OAUTH2_" + UUID.randomUUID().toString());

            userRepository.save(newUser);
        }

        // Return the OAuth2User principal (Spring Security will handle authentication)
        return oAuth2User;
    }

    /**
     * Generates a unique username by appending numbers if the base username already
     * exists.
     */
    private String generateUniqueUsername(String baseUsername) {
        String candidate = baseUsername;
        int counter = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = baseUsername + counter;
            counter++;
        }
        return candidate;
    }
}
