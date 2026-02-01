package com.chirp.repository;

import com.chirp.model.Notification;
import com.chirp.model.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotifRepo extends JpaRepository<Notification, Long> {

    // Fetch all notifications for a user, newest first
    List<Notification> findAllByRecipientOrderByCreatedAtDesc(User recipient);

    // Optional: fetch unread notifications
    List<Notification> findAllByRecipientAndReadFalseOrderByCreatedAtDesc(User recipient);
}
