package com.example.QucikTurn.Repository;

import com.example.QucikTurn.Entity.mongo.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    // Query chat between 2 users with sorting by timestamp (ascending)
    @Query(value = "{ $or: [ { senderId: ?0, recipientId: ?1 }, { senderId: ?1, recipientId: ?0 } ] }", sort = "{ timestamp: 1 }")
    List<ChatMessage> findChatBetweenUsers(Long userId1, Long userId2);

    // Paginated version for large chat histories
    @Query(value = "{ $or: [ { senderId: ?0, recipientId: ?1 }, { senderId: ?1, recipientId: ?0 } ] }")
    Page<ChatMessage> findChatBetweenUsersPaged(Long userId1, Long userId2, Pageable pageable);

    // Count unread messages for a recipient
    long countByRecipientIdAndIsReadFalse(Long recipientId);

    // Count unread messages from a specific sender
    long countByRecipientIdAndSenderIdAndIsReadFalse(Long recipientId, Long senderId);

    // Find unread messages to mark as read
    List<ChatMessage> findByRecipientIdAndSenderIdAndIsReadFalse(Long recipientId, Long senderId);

    // Get the latest message between two users (sorted by timestamp desc, limit 1)
    @Query(value = "{ $or: [ { senderId: ?0, recipientId: ?1 }, { senderId: ?1, recipientId: ?0 } ] }", sort = "{ timestamp: -1 }")
    List<ChatMessage> findLatestMessageBetweenUsers(Long userId1, Long userId2);
}
