package com.example.QucikTurn.Controller;

import com.example.QucikTurn.Entity.mongo.ChatMessage;
import com.example.QucikTurn.Repository.UserRepository;
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
    public void sendMessage(@Payload com.example.QucikTurn.dto.ChatMessageDTO chatMessageDTO) {
        // Simpan ke MongoDB
        ChatMessage saved = chatService.saveMessage(
                chatMessageDTO.getSenderId(),
                chatMessageDTO.getRecipientId(),
                chatMessageDTO.getContent()
        );

        // Convert to DTO for sending to clients
        com.example.QucikTurn.dto.ChatMessageDTO responseDTO = new com.example.QucikTurn.dto.ChatMessageDTO();
        responseDTO.setId(saved.getId());
        responseDTO.setSenderId(saved.getSenderId());
        responseDTO.setRecipientId(saved.getRecipientId());
        responseDTO.setContent(saved.getContent());
        responseDTO.setTimestamp(saved.getTimestamp());
        
        // Get sender name from user repository to include in the response
        try {
            var sender = userRepository.findById(saved.getSenderId());
            if (sender.isPresent()) {
                responseDTO.setSenderName(sender.get().getNama());
            }
        } catch (Exception e) {
            // Log error but don't break the chat
            e.printStackTrace();
        }

        // Kirim notifikasi real-time ke Penerima (Topik khusus user)
        // Client penerima harus subscribe ke: /user/{recipientId}/queue/messages (Advance)
        // Atau cara simpel: Subscribe ke /topic/public/{recipientId}

        // Disini kita broadcast ke topic spesifik penerima
        messagingTemplate.convertAndSend(
                "/topic/public/" + chatMessageDTO.getRecipientId(),
                responseDTO
        );

        // (Opsional) Kirim balik ke pengirim biar UI update (ack)
        messagingTemplate.convertAndSend(
                "/topic/public/" + chatMessageDTO.getSenderId(),
                responseDTO
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
