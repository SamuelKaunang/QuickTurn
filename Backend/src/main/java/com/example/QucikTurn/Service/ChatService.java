
package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.mongo.ChatMessage;
import com.example.QucikTurn.Repository.ChatMessageRepository;
import com.example.QucikTurn.Repository.UserRepository;
import com.example.QucikTurn.dto.ChatResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired private ChatMessageRepository chatMessageRepository;
    @Autowired private UserRepository userRepository; // MySQL Repo

    public ChatMessage saveMessage(Long senderId, Long recipientId, String content) {
        ChatMessage chat = new ChatMessage(senderId, recipientId, content);
        return chatMessageRepository.save(chat);
    }

    public List<ChatResponseDTO> getChatHistory(Long userId1, Long userId2) {
        // 1. Ambil raw data dari MongoDB
        List<ChatMessage> chats = chatMessageRepository
                .findBySenderIdAndRecipientIdOrSenderIdAndRecipientIdOrderByTimestampAsc(
                        userId1, userId2, userId2, userId1
                );

        // 2. Ambil User info dari MySQL (Optimized Query)
        // Kita butuh info User 1 dan User 2
        List<User> users = userRepository.findAllById(List.of(userId1, userId2));

        // Convert List User ke Map biar gampang di-get by ID
        Map<Long, String> userNames = users.stream()
                .collect(Collectors.toMap(User::getId, User::getNama));

        // 3. Mapping (Manual Join)
        List<ChatResponseDTO> result = new ArrayList<>();
        for (ChatMessage chat : chats) {
            String name = userNames.getOrDefault(chat.getSenderId(), "Unknown");

            result.add(new ChatResponseDTO(
                    chat.getId(),
                    chat.getSenderId(),
                    name,
                    chat.getContent(),
                    chat.getTimestamp()
            ));
        }

        return result;
    }
}