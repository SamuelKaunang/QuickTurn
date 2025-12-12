package com.example.QucikTurn.Controller;

import com.example.QucikTurn.Entity.mongo.ChatMessage;
import com.example.QucikTurn.Service.ChatService;
import com.example.QucikTurn.dto.ChatResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

@Controller // Note: Pake @Controller, bukan @RestController buat WebSocket
public class ChatController {

    @Autowired private SimpMessagingTemplate messagingTemplate;
    @Autowired private ChatService chatService;

    // 1. Handle kirim pesan via WebSocket
    // Client kirim ke: /app/chat.sendMessage
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        // Simpan ke MongoDB
        ChatMessage saved = chatService.saveMessage(
                chatMessage.getSenderId(),
                chatMessage.getRecipientId(),
                chatMessage.getContent()
        );

        // Kirim notifikasi real-time ke Penerima (Topik khusus user)
        // Client penerima harus subscribe ke: /user/{recipientId}/queue/messages (Advance)
        // Atau cara simpel: Subscribe ke /topic/chat/{recipientId}

        // Disini kita broadcast ke topic spesifik penerima
        messagingTemplate.convertAndSend(
                "/topic/public/" + chatMessage.getRecipientId(),
                saved
        );

        // (Opsional) Kirim balik ke pengirim biar UI update (ack)
        messagingTemplate.convertAndSend(
                "/topic/public/" + chatMessage.getSenderId(),
                saved
        );
    }

    // 2. REST API buat load history (dipanggil pas pertama buka chat)
    @GetMapping("/api/chat/history")
    @ResponseBody
    public ResponseEntity<List<ChatResponseDTO>> getHistory(
            @RequestParam Long userId1,
            @RequestParam Long userId2) {

        return ResponseEntity.ok(chatService.getChatHistory(userId1, userId2));
    }
}