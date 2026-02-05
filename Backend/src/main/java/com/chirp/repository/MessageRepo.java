package com.chirp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.chirp.model.Message;

public interface MessageRepo extends JpaRepository<Message, Long> {
    @Query("SELECT m FROM Message m WHERE (m.sender.id = :userId AND m.recipient.id = :otherId) OR (m.sender.id = :otherId AND m.recipient.id = :userId) ORDER BY m.createdAt ASC")
    List<Message> findConversation(@Param("userId") Long userId, @Param("otherId") Long otherId);

    @Query(value = "SELECT DISTINCT CASE WHEN sender_id = :userId THEN recipient_id ELSE sender_id END FROM chirp_message WHERE sender_id = :userId OR recipient_id = :userId", nativeQuery = true)
    List<Long> findRecentConversationUserIds(@Param("userId") Long userId);
}
