package com.example.QucikTurn.dto;

import java.time.LocalDateTime;

public class ChatResponseDTO {
    private String messageId;
    private Long senderId;
    private String senderName; // Dari MySQL
    private String content;
    private LocalDateTime timestamp;

    // Attachment fields
    private String attachmentUrl;
    private String attachmentType;
    private String originalFilename;
    private Long fileSize;

    // Constructor
    public ChatResponseDTO(String messageId, Long senderId, String senderName, String content,
            LocalDateTime timestamp) {
        this.messageId = messageId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.content = content;
        this.timestamp = timestamp;
    }

    // Constructor with attachment
    public ChatResponseDTO(String messageId, Long senderId, String senderName, String content, LocalDateTime timestamp,
            String attachmentUrl, String attachmentType, String originalFilename, Long fileSize) {
        this.messageId = messageId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.content = content;
        this.timestamp = timestamp;
        this.attachmentUrl = attachmentUrl;
        this.attachmentType = attachmentType;
        this.originalFilename = originalFilename;
        this.fileSize = fileSize;
    }

    // Manual Getters Setters (kalo gak pake Lombok)
    public String getMessageId() {
        return messageId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    // Attachment getters
    public String getAttachmentUrl() {
        return attachmentUrl;
    }

    public String getAttachmentType() {
        return attachmentType;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public Long getFileSize() {
        return fileSize;
    }

    // Setters for attachment
    public void setAttachmentUrl(String attachmentUrl) {
        this.attachmentUrl = attachmentUrl;
    }

    public void setAttachmentType(String attachmentType) {
        this.attachmentType = attachmentType;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }
}