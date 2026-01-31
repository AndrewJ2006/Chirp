package com.chirp.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chirp.dto.Follower;
import com.chirp.dto.Following;
import com.chirp.model.User;
import com.chirp.service.RelService;
import com.chirp.service.UserService;

@RestController
@RequestMapping("/relationships")
public class RelController {
    
    private final RelService relService;
    private final UserService userService;


    public RelController(RelService relService, UserService userService) {
        this.relService = relService;
        this.userService = userService;
    }
    @PostMapping("/follow")
    public Following followUser(@AuthenticationPrincipal User requester,@RequestParam Long followingId) {

        User following = userService.findById(followingId)
            .orElseThrow(() -> new IllegalArgumentException("User does not exist"));

        return relService.followUser(requester, following);
    }


    @PostMapping("/unfollow")
    public Following unfollowUser(@AuthenticationPrincipal User requester, @RequestParam Long followingId) {

        User following = userService.findById(followingId)
            .orElseThrow(() -> new IllegalArgumentException("User does not exist"));

        return relService.unfollowUser(requester, following);
    }


    @GetMapping("/followers/{userId}")
    public List<Follower> getFollowers(@PathVariable Long userId, @AuthenticationPrincipal User requester) {

        return relService.getFollowers(userId, requester);
    }


    @GetMapping("/following/{userId}")
    public List<Following> getFollowing(@PathVariable Long userId, @AuthenticationPrincipal User requester) {

        return relService.getFollowing(userId, requester);

    }

    @GetMapping("/is-following")
    public boolean isFollowing(@AuthenticationPrincipal User requester, @RequestParam Long followingId) {

        User following = userService.findById(followingId)
            .orElseThrow(() -> new IllegalArgumentException("User does not exist"));

        return relService.isFollowing(requester, following);
    }


}
