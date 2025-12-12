package com.example.QucikTurn.Repository;

import com.example.QucikTurn.Entity.mongo.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    // Custom query buat ambil chat antara 2 user (Sender -> Receiver OR Receiver -> Sender)
    // Logikanya: Ambil chat di mana (sender=A AND recipient=B) OR (sender=B AND recipient=A)
    List<ChatMessage> findBySenderIdAndRecipientIdOrSenderIdAndRecipientIdOrderByTimestampAsc(
            Long senderId1, Long recipientId1, Long senderId2, Long recipientId2
    );
}