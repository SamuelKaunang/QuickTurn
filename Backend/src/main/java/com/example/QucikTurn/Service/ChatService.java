package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.mongo.ChatMessage;
import com.example.QucikTurn.Repository.ApplicationRepository;
import com.example.QucikTurn.Repository.ChatMessageRepository;
import com.example.QucikTurn.Repository.UserRepository;
import com.example.QucikTurn.dto.ChatResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ApplicationRepository applicationRepository;

    /**
     * Save a chat message after validating contract permission
     */
    public ChatMessage saveMessage(Long senderId, Long recipientId, String content) {
        validateChatPermission(senderId, recipientId);

        ChatMessage chat = new ChatMessage(senderId, recipientId, content);
        return chatMessageRepository.save(chat);
    }

    /**
     * Save a chat message with attachment
     */
    public ChatMessage saveMessageWithAttachment(Long senderId, Long recipientId, String content,
            String attachmentUrl, String attachmentType,
            String originalFilename, Long fileSize) {
        validateChatPermission(senderId, recipientId);

        ChatMessage chat = new ChatMessage(senderId, recipientId, content);
        chat.setAttachmentUrl(attachmentUrl);
        chat.setAttachmentType(attachmentType);
        chat.setOriginalFilename(originalFilename);
        chat.setFileSize(fileSize);
        return chatMessageRepository.save(chat);
    }

    /**
     * Get chat history between two users (non-paginated, sorted by timestamp)
     */
    public List<ChatResponseDTO> getChatHistory(Long userId1, Long userId2) {
        validateChatPermission(userId1, userId2);

        List<ChatMessage> chats = chatMessageRepository.findChatBetweenUsers(userId1, userId2);
        return mapToResponseDTO(chats, userId1, userId2);
    }

    /**
     * Get paginated chat history between two users
     */
    public Page<ChatResponseDTO> getChatHistoryPaged(Long userId1, Long userId2, int page, int size) {
        validateChatPermission(userId1, userId2);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<ChatMessage> chatPage = chatMessageRepository.findChatBetweenUsersPaged(userId1, userId2, pageable);

        // Get user names once
        Map<Long, String> userNames = getUserNames(userId1, userId2);

        return chatPage.map(chat -> new ChatResponseDTO(
                chat.getId(),
                chat.getSenderId(),
                userNames.getOrDefault(chat.getSenderId(), "Unknown"),
                chat.getContent(),
                chat.getTimestamp()));
    }

    /**
     * Mark all messages from a sender as read for the recipient
     */
    public void markMessagesAsRead(Long recipientId, Long senderId) {
        List<ChatMessage> unreadMessages = chatMessageRepository
                .findByRecipientIdAndSenderIdAndIsReadFalse(recipientId, senderId);

        for (ChatMessage msg : unreadMessages) {
            msg.setRead(true);
        }

        if (!unreadMessages.isEmpty()) {
            chatMessageRepository.saveAll(unreadMessages);
        }
    }

    /**
     * Get count of unread messages for a user
     */
    public long getUnreadCount(Long recipientId) {
        return chatMessageRepository.countByRecipientIdAndIsReadFalse(recipientId);
    }

    /**
     * Get count of unread messages from a specific sender
     */
    public long getUnreadCountFromSender(Long recipientId, Long senderId) {
        return chatMessageRepository.countByRecipientIdAndSenderIdAndIsReadFalse(recipientId, senderId);
    }

    /**
     * Validate that two users have an active contract (APPROVED application)
     */
    public boolean hasActiveContract(Long userId1, Long userId2) {
        // Check if userId1 is student with approved app to userId2's project
        boolean hasContract = applicationRepository.findByStudentId(userId1)
                .stream()
                .anyMatch(app -> app.getStatus().name().equals("APPROVED") &&
                        app.getProject().getOwner().getId().equals(userId2));

        if (!hasContract) {
            // Check reverse: userId2 is student with approved app to userId1's project
            hasContract = applicationRepository.findByStudentId(userId2)
                    .stream()
                    .anyMatch(app -> app.getStatus().name().equals("APPROVED") &&
                            app.getProject().getOwner().getId().equals(userId1));
        }

        return hasContract;
    }

    /**
     * Get the timestamp of the last message between two users
     * Used for sorting contacts by most recent conversation
     */
    public java.time.LocalDateTime getLastMessageTime(Long userId1, Long userId2) {
        List<ChatMessage> messages = chatMessageRepository.findLatestMessageBetweenUsers(userId1, userId2);
        if (messages != null && !messages.isEmpty()) {
            return messages.get(0).getTimestamp();
        }
        return null;
    }

    // -------- PRIVATE HELPER METHODS --------

    private void validateChatPermission(Long userId1, Long userId2) {
        if (!hasActiveContract(userId1, userId2)) {
            throw new RuntimeException("Tidak dapat mengakses chat: Tidak ada kontrak aktif antara kedua user");
        }
    }

    private Map<Long, String> getUserNames(Long userId1, Long userId2) {
        List<User> users = userRepository.findAllById(List.of(userId1, userId2));
        return users.stream()
                .collect(Collectors.toMap(
                        User::getId,
                        user -> {
                            // Show "Deleted User" for deleted accounts
                            if (user.isDeleted()) {
                                return "Deleted User";
                            }
                            if (user.getNama() != null && !user.getNama().isEmpty()) {
                                return user.getNama();
                            }
                            return user.getEmail();
                        }));
    }

    private List<ChatResponseDTO> mapToResponseDTO(List<ChatMessage> chats, Long userId1, Long userId2) {
        Map<Long, String> userNames = getUserNames(userId1, userId2);

        List<ChatResponseDTO> result = new ArrayList<>();
        for (ChatMessage chat : chats) {
            String name = userNames.getOrDefault(chat.getSenderId(), "Unknown");
            ChatResponseDTO dto = new ChatResponseDTO(
                    chat.getId(),
                    chat.getSenderId(),
                    name,
                    chat.getContent(),
                    chat.getTimestamp());
            // Add attachment info if present
            if (chat.getAttachmentUrl() != null) {
                dto.setAttachmentUrl(chat.getAttachmentUrl());
                dto.setAttachmentType(chat.getAttachmentType());
                dto.setOriginalFilename(chat.getOriginalFilename());
                dto.setFileSize(chat.getFileSize());
            }
            result.add(dto);
        }
        return result;
    }
}
