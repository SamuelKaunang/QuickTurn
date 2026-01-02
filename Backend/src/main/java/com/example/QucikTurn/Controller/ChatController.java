package com.example.QucikTurn.Controller;

import com.example.QucikTurn.Entity.mongo.ChatMessage;
import com.example.QucikTurn.Repository.ApplicationRepository;
import com.example.QucikTurn.Repository.UserRepository;
import com.example.QucikTurn.Service.ChatService;
import com.example.QucikTurn.Service.FileStorageService;
import com.example.QucikTurn.dto.ChatMessageDTO;
import com.example.QucikTurn.dto.ChatResponseDTO;
import com.example.QucikTurn.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.QucikTurn.Entity.User;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private ChatService chatService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ApplicationRepository applicationRepository;
    @Autowired
    private FileStorageService fileStorageService;

    // ========== WEBSOCKET ENDPOINTS ==========

    /**
     * Handle sending messages via WebSocket
     * Client sends to: /app/chat.sendMessage
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDTO chatMessageDTO) {
        try {
            Long senderId = chatMessageDTO.getSenderId();
            Long recipientId = chatMessageDTO.getRecipientId();

            ChatMessage saved;

            // Check if message has attachment
            if (chatMessageDTO.getAttachmentUrl() != null && !chatMessageDTO.getAttachmentUrl().isEmpty()) {
                saved = chatService.saveMessageWithAttachment(
                        senderId,
                        recipientId,
                        chatMessageDTO.getContent(),
                        chatMessageDTO.getAttachmentUrl(),
                        chatMessageDTO.getAttachmentType(),
                        chatMessageDTO.getOriginalFilename(),
                        chatMessageDTO.getFileSize());
            } else {
                saved = chatService.saveMessage(
                        senderId,
                        recipientId,
                        chatMessageDTO.getContent());
            }

            // Build response DTO
            ChatMessageDTO responseDTO = new ChatMessageDTO();
            responseDTO.setId(saved.getId());
            responseDTO.setSenderId(saved.getSenderId());
            responseDTO.setRecipientId(saved.getRecipientId());
            responseDTO.setContent(saved.getContent());
            responseDTO.setTimestamp(saved.getTimestamp());

            // Include attachment info if present
            if (saved.getAttachmentUrl() != null) {
                responseDTO.setAttachmentUrl(saved.getAttachmentUrl());
                responseDTO.setAttachmentType(saved.getAttachmentType());
                responseDTO.setOriginalFilename(saved.getOriginalFilename());
                responseDTO.setFileSize(saved.getFileSize());
            }

            // Get sender name (show "Deleted User" if account is deleted)
            Long senderIdValue = saved.getSenderId();
            if (senderIdValue != null) {
                userRepository.findById(senderIdValue)
                        .ifPresent(sender -> {
                            if (sender.isDeleted()) {
                                responseDTO.setSenderName("Deleted User");
                            } else {
                                responseDTO.setSenderName(sender.getNama());
                            }
                        });
            }

            // Send to recipient
            messagingTemplate.convertAndSend(
                    "/topic/public/" + recipientId,
                    responseDTO);

            // Send acknowledgment to sender
            messagingTemplate.convertAndSend(
                    "/topic/public/" + senderId,
                    responseDTO);

        } catch (Exception e) {
            // Send error notification to sender
            ChatMessageDTO errorDTO = new ChatMessageDTO();
            errorDTO.setContent("Error: " + e.getMessage());
            errorDTO.setSenderId(0L); // System message
            errorDTO.setRecipientId(chatMessageDTO.getSenderId());

            messagingTemplate.convertAndSend(
                    "/topic/errors/" + chatMessageDTO.getSenderId(),
                    errorDTO);
        }
    }

    /**
     * Handle WebSocket errors
     */
    @MessageExceptionHandler
    @SendToUser("/queue/errors")
    public String handleException(Throwable exception) {
        return "Error: " + exception.getMessage();
    }

    // ========== REST API ENDPOINTS ==========

    /**
     * Get chat history (non-paginated)
     */
    @GetMapping("/api/chat/history")
    @ResponseBody
    public ResponseEntity<ApiResponse<List<ChatResponseDTO>>> getHistory(
            @RequestParam Long otherUserId,
            @AuthenticationPrincipal User currentUser) {

        try {
            List<ChatResponseDTO> history = chatService.getChatHistory(currentUser.getId(), otherUserId);

            // Mark messages from otherUser as read
            chatService.markMessagesAsRead(currentUser.getId(), otherUserId);

            return ResponseEntity.ok(ApiResponse.ok("Chat history retrieved", history));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    /**
     * Get paginated chat history
     */
    @GetMapping("/api/chat/history/paged")
    @ResponseBody
    public ResponseEntity<ApiResponse<Page<ChatResponseDTO>>> getHistoryPaged(
            @RequestParam Long otherUserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal User currentUser) {

        try {
            Page<ChatResponseDTO> history = chatService.getChatHistoryPaged(
                    currentUser.getId(), otherUserId, page, size);

            // Mark messages as read when viewing
            chatService.markMessagesAsRead(currentUser.getId(), otherUserId);

            return ResponseEntity.ok(ApiResponse.ok("Chat history retrieved", history));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    /**
     * Get unread message count
     */
    @GetMapping("/api/chat/unread")
    @ResponseBody
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal User currentUser) {

        long count = chatService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Unread count retrieved",
                Map.of("unreadCount", count)));
    }

    /**
     * Get unread count from specific user
     */
    @GetMapping("/api/chat/unread/{senderId}")
    @ResponseBody
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCountFromSender(
            @PathVariable Long senderId,
            @AuthenticationPrincipal User currentUser) {

        long count = chatService.getUnreadCountFromSender(currentUser.getId(), senderId);
        return ResponseEntity.ok(ApiResponse.ok("Unread count retrieved",
                Map.of("unreadCount", count)));
    }

    /**
     * Mark messages as read
     */
    @PostMapping("/api/chat/mark-read")
    @ResponseBody
    public ResponseEntity<ApiResponse<String>> markAsRead(
            @RequestParam Long senderId,
            @AuthenticationPrincipal User currentUser) {

        chatService.markMessagesAsRead(currentUser.getId(), senderId);
        return ResponseEntity.ok(ApiResponse.ok("Messages marked as read", null));
    }

    /**
     * Upload chat attachment (image or document)
     * Returns file info that client will include in WebSocket message
     */
    @PostMapping("/api/chat/upload")
    @ResponseBody
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadChatAttachment(
            @RequestParam("file") MultipartFile file,
            @RequestParam("recipientId") Long recipientId,
            @AuthenticationPrincipal User currentUser) {

        try {
            // Validate chat permission
            if (!chatService.hasActiveContract(currentUser.getId(), recipientId)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.fail("Cannot upload: No active contract with this user"));
            }

            // Upload file
            Map<String, Object> fileInfo = fileStorageService.uploadChatAttachment(file, currentUser);
            return ResponseEntity.ok(ApiResponse.ok("File uploaded successfully", fileInfo));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.fail("Failed to upload file: " + e.getMessage()));
        }
    }

    /**
     * Get list of chat contacts (users with active contracts)
     */
    @GetMapping("/api/chat/contacts")
    @ResponseBody
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getChatContacts(
            @AuthenticationPrincipal User currentUser) {

        List<Map<String, Object>> contacts = getContactsForUser(currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Chat contacts retrieved", contacts));
    }

    /**
     * Start chat (validate contract exists)
     */
    @PostMapping("/api/chat/start")
    @ResponseBody
    public ResponseEntity<ApiResponse<String>> startChat(
            @RequestParam Long otherUserId,
            @AuthenticationPrincipal User currentUser) {

        boolean hasContract = chatService.hasActiveContract(currentUser.getId(), otherUserId);

        if (!hasContract) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.fail("Tidak dapat memulai chat: Tidak ada kontrak aktif dengan user ini"));
        }

        return ResponseEntity.ok(ApiResponse.ok("Chat dapat dimulai", null));
    }

    // ========== PRIVATE HELPER METHODS ==========

    private List<Map<String, Object>> getContactsForUser(User currentUser) {
        if (currentUser.getRole().name().equals("MAHASISWA")) {
            // Mahasiswa: get UMKM from approved applications, deduplicated by userId
            Map<Long, Map<String, Object>> contactsMap = new java.util.LinkedHashMap<>();

            applicationRepository.findByStudentId(currentUser.getId())
                    .stream()
                    .filter(app -> app.getStatus().name().equals("APPROVED"))
                    .forEach(app -> {
                        User umkm = app.getProject().getOwner();
                        Long umkmId = umkm.getId();

                        if (contactsMap.containsKey(umkmId)) {
                            // User already exists, add project to list
                            @SuppressWarnings("unchecked")
                            java.util.List<String> projects = (java.util.List<String>) contactsMap.get(umkmId)
                                    .get("projects");
                            projects.add(app.getProject().getTitle());
                        } else {
                            // New user, create contact entry
                            Map<String, Object> contactMap = new java.util.HashMap<>();
                            contactMap.put("userId", umkmId);
                            contactMap.put("name", umkm.getNama());
                            contactMap.put("email", umkm.getEmail());
                            contactMap.put("role", umkm.getRole().name());
                            contactMap.put("profilePictureUrl", umkm.getProfilePictureUrl());
                            contactMap.put("projectTitle", app.getProject().getTitle());
                            contactMap.put("projects",
                                    new java.util.ArrayList<>(java.util.List.of(app.getProject().getTitle())));
                            contactMap.put("unreadCount", chatService.getUnreadCountFromSender(
                                    currentUser.getId(), umkmId));
                            // Add last message time for sorting
                            contactMap.put("lastMessageTime", chatService.getLastMessageTime(
                                    currentUser.getId(), umkmId));
                            contactsMap.put(umkmId, contactMap);
                        }
                    });

            // Sort by lastMessageTime descending (most recent first), then by unread count
            return contactsMap.values().stream()
                    .sorted((a, b) -> {
                        // First prioritize contacts with unread messages
                        Long unreadA = (Long) a.getOrDefault("unreadCount", 0L);
                        Long unreadB = (Long) b.getOrDefault("unreadCount", 0L);
                        if (unreadB > 0 && unreadA == 0)
                            return 1;
                        if (unreadA > 0 && unreadB == 0)
                            return -1;

                        // Then sort by last message time
                        java.time.LocalDateTime timeA = (java.time.LocalDateTime) a.get("lastMessageTime");
                        java.time.LocalDateTime timeB = (java.time.LocalDateTime) b.get("lastMessageTime");
                        if (timeA == null && timeB == null)
                            return 0;
                        if (timeA == null)
                            return 1;
                        if (timeB == null)
                            return -1;
                        return timeB.compareTo(timeA);
                    })
                    .collect(Collectors.toList());
        } else {
            // UMKM: get students with approved applications, deduplicated by userId
            Map<Long, Map<String, Object>> contactsMap = new java.util.LinkedHashMap<>();

            applicationRepository.findByProject_Owner_Id(currentUser.getId())
                    .stream()
                    .filter(app -> app.getStatus().name().equals("APPROVED"))
                    .forEach(app -> {
                        User mahasiswa = app.getStudent();
                        Long mahasiswaId = mahasiswa.getId();

                        if (contactsMap.containsKey(mahasiswaId)) {
                            // User already exists, add project to list
                            @SuppressWarnings("unchecked")
                            java.util.List<String> projects = (java.util.List<String>) contactsMap.get(mahasiswaId)
                                    .get("projects");
                            projects.add(app.getProject().getTitle());
                        } else {
                            // New user, create contact entry
                            Map<String, Object> contactMap = new java.util.HashMap<>();
                            contactMap.put("userId", mahasiswaId);
                            contactMap.put("name", mahasiswa.getNama());
                            contactMap.put("email", mahasiswa.getEmail());
                            contactMap.put("role", mahasiswa.getRole().name());
                            contactMap.put("profilePictureUrl", mahasiswa.getProfilePictureUrl());
                            contactMap.put("projectTitle", app.getProject().getTitle());
                            contactMap.put("projects",
                                    new java.util.ArrayList<>(java.util.List.of(app.getProject().getTitle())));
                            contactMap.put("unreadCount", chatService.getUnreadCountFromSender(
                                    currentUser.getId(), mahasiswaId));
                            // Add last message time for sorting
                            contactMap.put("lastMessageTime", chatService.getLastMessageTime(
                                    currentUser.getId(), mahasiswaId));
                            contactsMap.put(mahasiswaId, contactMap);
                        }
                    });

            // Sort by lastMessageTime descending (most recent first), then by unread count
            return contactsMap.values().stream()
                    .sorted((a, b) -> {
                        // First prioritize contacts with unread messages
                        Long unreadA = (Long) a.getOrDefault("unreadCount", 0L);
                        Long unreadB = (Long) b.getOrDefault("unreadCount", 0L);
                        if (unreadB > 0 && unreadA == 0)
                            return 1;
                        if (unreadA > 0 && unreadB == 0)
                            return -1;

                        // Then sort by last message time
                        java.time.LocalDateTime timeA = (java.time.LocalDateTime) a.get("lastMessageTime");
                        java.time.LocalDateTime timeB = (java.time.LocalDateTime) b.get("lastMessageTime");
                        if (timeA == null && timeB == null)
                            return 0;
                        if (timeA == null)
                            return 1;
                        if (timeB == null)
                            return -1;
                        return timeB.compareTo(timeA);
                    })
                    .collect(Collectors.toList());
        }
    }
}
