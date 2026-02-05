package com.chirp.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.chirp.model.User;

public interface UserRepo extends JpaRepository<User, Long> {
      Optional<User> findByUsername(String username);
      Optional<User> findByEmail(String email);
      Optional<User> findById(Long Id);
      
      @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))")
      List<User> searchUsers(@Param("query") String query);
}
