package com.example.QucikTurn.dto;

import java.time.LocalDateTime;

public class ChatResponseDTO {
    private String messageId;
    private Long senderId;
    private String senderName; // Dari MySQL
    private String content;
    private LocalDateTime timestamp;

    // Constructor, Getters, Setters
    public ChatResponseDTO(String messageId, Long senderId, String senderName, String content, LocalDateTime timestamp) {
        this.messageId = messageId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.content = content;
        this.timestamp = timestamp;
    }

    // Manual Getters Setters (kalo gak pake Lombok)
    public String getMessageId() { return messageId; }
    public Long getSenderId() { return senderId; }
    public String getSenderName() { return senderName; }
    public String getContent() { return content; }
    public LocalDateTime getTimestamp() { return timestamp; }
}