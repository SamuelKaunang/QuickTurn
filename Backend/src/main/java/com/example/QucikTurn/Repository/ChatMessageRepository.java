package com.example.QucikTurn.Repository;

import com.example.QucikTurn.Entity.mongo.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    // Custom query buat ambil chat antara 2 user (Sender -> Receiver OR Receiver -> Sender)
    // Logikanya: Ambil chat di mana (sender=A AND recipient=B) OR (sender=B AND recipient=A)
    // Using @Query for clarity
    @Query("{ $or: [ { senderId: ?0, recipientId: ?1 }, { senderId: ?1, recipientId: ?0 } ] }")
    List<ChatMessage> findChatBetweenUsers(Long userId1, Long userId2);
    
    // Keep the old method for compatibility, but implement using @Query
    default List<ChatMessage> findBySenderIdAndRecipientIdOrSenderIdAndRecipientIdOrderByTimestampAsc(
            Long senderId1, Long recipientId1, Long senderId2, Long recipientId2) {
        // The parameters are in order: (senderId1, recipientId1, senderId2, recipientId2)
        // But the actual call in ChatService is with (userId1, userId2, userId2, userId1)
        // So we need to find chats between userId1 and userId2
        // Since userId1 = senderId1 and userId2 = recipientId1, we can use findChatBetweenUsers
        return findChatBetweenUsers(senderId1, recipientId1);
    }
    @Query("{ $or: [ { senderId: ?0, recipientId: ?1 }, { senderId: ?1, recipientId: ?0 } ] }")
    List<ChatMessage> findChatBetweenUsers(Long userId1, Long userId2);
    
    // Keep the old method for compatibility, but implement using @Query
    default List<ChatMessage> findBySenderIdAndRecipientIdOrSenderIdAndRecipientIdOrderByTimestampAsc(
            Long senderId1, Long recipientId1, Long senderId2, Long recipientId2) {
        // This should be userId1, userId2 where userId1 is senderId1 and userId2 is recipientId1
        // But to maintain compatibility, we'll use the new method
        // However, the parameters are confusing, so let's use a different approach
        // Since the old method is called with (userId1, userId2, userId2, userId1)
        // We can just call findChatBetweenUsers with the first two parameters
        return findChatBetweenUsers(senderId1, recipientId1);
    }
}
