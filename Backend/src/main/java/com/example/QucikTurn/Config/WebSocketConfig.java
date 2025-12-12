package com.example.QucikTurn.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {


    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Prefix buat url yang dituju frontend (client subscribe)
        registry.enableSimpleBroker("/topic", "/queue");
        // Prefix buat pesan yang dikirim client ke server
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 1. Endpoint untuk Frontend Web (pakai SockJS)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        // 2. Endpoint Khusus Postman / Mobile App (TANPA SockJS)
        registry.addEndpoint("/ws-raw") // <--- Nama path beda
                .setAllowedOriginPatterns("*"); // <--- Gak pake .withSockJS()
    }
}