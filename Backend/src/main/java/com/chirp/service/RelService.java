package com.chirp.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chirp.dto.Follower;
import com.chirp.dto.Following;
import com.chirp.model.Rel;
import com.chirp.model.User;
import com.chirp.repository.RelRepo;
import com.chirp.repository.UserRepo;

@Service
public class RelService {
    
    private final RelRepo relReop;
    private final UserRepo userRepo;
    private final NotifService notifService;

    public RelService(RelRepo relReop, UserRepo userRepo, NotifService notifService) {

        this.relReop = relReop;
        this.userRepo = userRepo;
        this.notifService = notifService;

    }

   

    public Following followUser(User follower, User following) {
        

        if (follower.getId().equals(following.getId())) {
            throw new IllegalArgumentException("Cannot follow yourself");
        }

        if (relReop.findByFollowerAndFollowing(follower, following).isPresent()) {
            throw new IllegalArgumentException("Relationship already exists");

        }
        
        Rel relation = new Rel();
        relation.setFollower(follower);
        relation.setFollowing(following);
        relReop.save(relation);

        // Create notification for the followed user
        notifService.createNotification(
            following,
            follower,
            null,
            "FOLLOW",
            follower.getUsername() + " started following you"
        );

        Following dto = new Following();
        dto.setId(following.getId());
        dto.setUsername(following.getUsername());
        return dto;
    }

    @Transactional
    public Following unfollowUser(User follower, User following) {

        if(relReop.findByFollowerAndFollowing(follower, following).isEmpty()) {
             throw new IllegalArgumentException("Still following other user");
        }
        relReop.deleteByFollowerAndFollowing(follower, following);

        Following dto = new Following();
        dto.setId(following.getId());
        dto.setUsername(following.getUsername());
        return dto;
    }


        public List<Follower> getFollowers(Long userId, User requester) {
            
            Optional<User> userOpt = userRepo.findById(userId);
            if(userOpt.isEmpty()) {
                throw new IllegalArgumentException("User does not exist");
            }
            User user = userOpt.get();

            //Privacy
            if (user.isPrivate()) {
                if (!user.getId().equals(requester.getId())
                    && !isFollowing(requester, user)) {
                    throw new IllegalArgumentException("This account is private");
                }
            }

            List<Rel> relList = relReop.findByFollowing(user);

            List<Follower> followers = new ArrayList<>();

            for (Rel rel : relList) {
                Follower dto = new Follower();
                dto.setId(rel.getFollower().getId());
                dto.setUsername(rel.getFollower().getUsername());
                followers.add(dto);
            }

            return followers;
            
            
        }

        public List<Following> getFollowing(Long userId, User requester) {

           Optional<User> userOpt = userRepo.findById(userId);
           if(userOpt.isEmpty()) {
            throw new IllegalArgumentException("User does not exit");
           }
           User user = userOpt.get();

           //Privacy
            if (user.isPrivate()) {
                if (!user.getId().equals(requester.getId())
                    && !isFollowing(requester, user)) {
                    throw new IllegalArgumentException("This account is private");
                }
            }
           
           
            List<Rel> relList = relReop.findByFollower(user);

            List<Following> following = new ArrayList<>();

             for (Rel rel : relList) {
                Following dto = new Following();
                dto.setId(rel.getFollowing().getId());
                dto.setUsername(rel.getFollowing().getUsername());
                following.add(dto);
            }
            return following;
            
        }



        public boolean isFollowing(User follower, User following) {
            return relReop.findByFollowerAndFollowing(follower, following).isPresent();
        }


        public List<User> getFollowingUsers(Long userId) {


            User user = userRepo.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User does not exist"));

            List<Rel> relList = relReop.findByFollower(user); 
            List<User> users = new ArrayList<>();
            for (Rel rel : relList) {
                users.add(rel.getFollowing());
            }
            return users;
        }




}
