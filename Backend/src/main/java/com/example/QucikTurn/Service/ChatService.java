
package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.mongo.ChatMessage;
import com.example.QucikTurn.Repository.ApplicationRepository;
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
    @Autowired private ApplicationRepository applicationRepository;

    public ChatMessage saveMessage(Long senderId, Long recipientId, String content) {
        // Validasi: Pastikan ada kontrak aktif antara kedua user
        validateChatPermission(senderId, recipientId);
        
        ChatMessage chat = new ChatMessage(senderId, recipientId, content);
        return chatMessageRepository.save(chat);
    }

    public List<ChatResponseDTO> getChatHistory(Long userId1, Long userId2) {
        // Validasi: Pastikan ada kontrak aktif antara kedua user
        validateChatPermission(userId1, userId2);
        
        // 1. Ambil raw data dari MongoDB using the clearer method
        List<ChatMessage> chats = chatMessageRepository.findChatBetweenUsers(userId1, userId2);

        // 2. Ambil User info dari MySQL (Optimized Query)
        // Kita butuh info User 1 dan User 2
        List<User> users = userRepository.findAllById(List.of(userId1, userId2));

        // Convert List User ke Map biar gampang di-get by ID
        // Using getNama() which is the correct method in User entity
        Map<Long, String> userNames = users.stream()
                .collect(Collectors.toMap(
                    User::getId, 
                    user -> {
                        if (user.getNama() != null && !user.getNama().isEmpty()) {
                            return user.getNama();
                        } else {
                            return user.getEmail();
                        }
                    }
                ));

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

    private void validateChatPermission(Long userId1, Long userId2) {
        // Cek apakah ada kontrak aktif (Application dengan status APPROVED) antara kedua user
        // Kontrak aktif berarti ada aplikasi dengan status APPROVED di mana:
        // - userId1 adalah student dan userId2 adalah project owner, ATAU
        // - userId2 adalah student dan userId1 adalah project owner
        
        boolean hasActiveContract = applicationRepository.findByStudentId(userId1)
            .stream()
            .anyMatch(app -> app.getStatus().name().equals("APPROVED") && 
                           app.getProject().getOwner().getId().equals(userId2));
        
        if (!hasActiveContract) {
            hasActiveContract = applicationRepository.findByStudentId(userId2)
                .stream()
                .anyMatch(app -> app.getStatus().name().equals("APPROVED") && 
                               app.getProject().getOwner().getId().equals(userId1));
        }
        
        if (!hasActiveContract) {
            throw new RuntimeException("Tidak dapat mengakses chat: Tidak ada kontrak aktif antara kedua user");
        }
    }
}
