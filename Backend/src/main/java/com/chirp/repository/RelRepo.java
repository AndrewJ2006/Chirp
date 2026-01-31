package com.chirp.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chirp.model.Rel;
import com.chirp.model.User;

public interface RelRepo extends JpaRepository<Rel, Long> {

    Optional<Rel> findByFollowerAndFollowing(User follower, User following); //checks if relationship exists
    List<Rel> findByFollower(User follower); //all users a user is following
    List<Rel> findByFollowing(User following); //all users who follow a specifc user
    void deleteByFollowerAndFollowing(User follower, User following); 
}


