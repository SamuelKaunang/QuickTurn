package com.example.QucikTurn.Security.oauth2;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

/**
 * Custom OAuth2 User Service for Google Login.
 * This service simply delegates to the default implementation.
 * User creation/update is handled in OAuth2AuthenticationSuccessHandler.
 */
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        // Just delegate to default - user creation is handled in SuccessHandler
        return super.loadUser(userRequest);
    }
}
