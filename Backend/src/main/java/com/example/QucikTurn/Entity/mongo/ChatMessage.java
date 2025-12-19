package com.example.QucikTurn.Entity.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "chat_messages")
@CompoundIndex(name = "sender_recipient_idx", def = "{'senderId': 1, 'recipientId': 1}")
public class ChatMessage {
    @Id
    private String id;

    @Indexed
    private Long senderId; // Relasi logical ke MySQL User ID

    @Indexed
    private Long recipientId; // Relasi logical ke MySQL User ID

    private String content;

    @Indexed
    private LocalDateTime timestamp;

    private boolean isRead = false; // Track read status

    // Constructors
    public ChatMessage() {
    }

    public ChatMessage(Long senderId, Long recipientId, String content) {
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.content = content;
        this.timestamp = LocalDateTime.now();
        this.isRead = false;
    }

    // Getters Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public Long getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Long recipientId) {
        this.recipientId = recipientId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }
}