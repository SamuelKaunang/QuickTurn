package com.example.QucikTurn.Controller;

import com.example.QucikTurn.Entity.mongo.ChatMessage;
import com.example.QucikTurn.Repository.ApplicationRepository;
import com.example.QucikTurn.Repository.UserRepository;
import com.example.QucikTurn.Service.ChatService;
import com.example.QucikTurn.dto.ChatResponseDTO;
import com.example.QucikTurn.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import com.example.QucikTurn.Entity.User;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller // Note: Pake @Controller, bukan @RestController buat WebSocket
public class ChatController {

    @Autowired private SimpMessagingTemplate messagingTemplate;
    @Autowired private ChatService chatService;
    @Autowired private UserRepository userRepository;
    @Autowired private ApplicationRepository applicationRepository;

    // 1. Handle kirim pesan via WebSocket
    // Client kirim ke: /app/chat.sendMessage
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload com.example.QucikTurn.dto.ChatMessageDTO chatMessageDTO) {
        // Validasi: Pastikan pengirim dan penerima memiliki kontrak aktif
        Long senderId = chatMessageDTO.getSenderId();
        Long recipientId = chatMessageDTO.getRecipientId();
        
        // Cek apakah ada kontrak aktif antara kedua user
        boolean hasActiveContract = applicationRepository.existsByProjectIdAndStudentId(senderId, recipientId) ||
                                   applicationRepository.existsByProjectIdAndStudentId(recipientId, senderId);
        
        // Untuk sementara, kita izinkan semua chat, tapi nanti bisa ditambahkan validasi
        // if (!hasActiveContract) {
        //     throw new RuntimeException("Tidak dapat mengirim pesan: Tidak ada kontrak aktif");
        // }

        // Simpan ke MongoDB
        ChatMessage saved = chatService.saveMessage(
                senderId,
                recipientId,
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
        // Client penerima harus subscribe ke: /topic/public/{recipientId}
        messagingTemplate.convertAndSend(
                "/topic/public/" + chatMessageDTO.getRecipientId(),
                responseDTO
        );

        // Kirim balik ke pengirim biar UI update (ack)
        messagingTemplate.convertAndSend(
                "/topic/public/" + chatMessageDTO.getSenderId(),
                responseDTO
        );
    }

    // 2. REST API buat load history (dipanggil pas pertama buka chat)
    @GetMapping("/api/chat/history")
    @ResponseBody
    public ResponseEntity<ApiResponse<List<ChatResponseDTO>>> getHistory(
            @RequestParam Long otherUserId,
            @AuthenticationPrincipal User currentUser) {
        
        List<ChatResponseDTO> history = chatService.getChatHistory(currentUser.getId(), otherUserId);
        return ResponseEntity.ok(ApiResponse.ok("Chat history retrieved", history));
    }

    // 3. Endpoint baru: Dapatkan daftar user yang bisa diajak chat (berdasarkan kontrak aktif)
    @GetMapping("/api/chat/contacts")
    @ResponseBody
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getChatContacts(
            @AuthenticationPrincipal User currentUser) {
        
        // Untuk mahasiswa: dapatkan semua UMKM yang memiliki project dengan aplikasi APPROVED
        // Untuk UMKM: dapatkan semua mahasiswa yang memiliki aplikasi APPROVED di project mereka
        
        List<Map<String, Object>> contacts;
        
        if (currentUser.getRole().name().equals("MAHASISWA")) {
            // Mahasiswa: dapatkan UMKM dari project yang dia apply dan APPROVED
            contacts = applicationRepository.findByStudentId(currentUser.getId())
                .stream()
                .filter(app -> app.getStatus().name().equals("APPROVED"))
                .map(app -> {
                    User umkm = app.getProject().getOwner();
                    return Map.of(
                        "userId", umkm.getId(),
                        "name", umkm.getNama(),
                        "email", umkm.getEmail(),
                        "role", umkm.getRole().name(),
                        "projectTitle", app.getProject().getTitle()
                    );
                })
                .collect(Collectors.toList());
        } else {
            // UMKM: dapatkan mahasiswa yang apply ke project mereka dan APPROVED
            contacts = applicationRepository.findByProject_Owner_Id(currentUser.getId())
                .stream()
                .filter(app -> app.getStatus().name().equals("APPROVED"))
                .map(app -> {
                    User mahasiswa = app.getStudent();
                    return Map.of(
                        "userId", mahasiswa.getId(),
                        "name", mahasiswa.getNama(),
                        "email", mahasiswa.getEmail(),
                        "role", mahasiswa.getRole().name(),
                        "projectTitle", app.getProject().getTitle()
                    );
                })
                .collect(Collectors.toList());
        }
        
        return ResponseEntity.ok(ApiResponse.ok("Chat contacts retrieved", contacts));
    }

    // 4. Endpoint untuk memulai chat (validasi kontrak)
    @PostMapping("/api/chat/start")
    @ResponseBody
    public ResponseEntity<ApiResponse<String>> startChat(
            @RequestParam Long otherUserId,
            @AuthenticationPrincipal User currentUser) {
        
        // Cek apakah ada kontrak aktif antara kedua user
        boolean hasContract = applicationRepository.findByStudentId(currentUser.getId())
            .stream()
            .anyMatch(app -> app.getStatus().name().equals("APPROVED") && 
                           (app.getProject().getOwner().getId().equals(otherUserId) || 
                            app.getStudent().getId().equals(otherUserId)));
        
        if (!hasContract) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.fail("Tidak dapat memulai chat: Tidak ada kontrak aktif dengan user ini"));
        }
        
        return ResponseEntity.ok(ApiResponse.ok("Chat dapat dimulai", null));
    }
}
