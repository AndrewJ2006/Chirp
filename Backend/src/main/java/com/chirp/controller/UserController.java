package com.chirp.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

import com.chirp.dto.LoginRequest;
import com.chirp.dto.ProfileRequest;
import com.chirp.dto.RegisterRequest;
import com.chirp.service.UserService;

@RestController
@RequestMapping("/users") 
public class UserController {

    private final UserService userService;

        public UserController(UserService userService) {
            this.userService = userService;
        }
    

         @PostMapping("/register")
         public Map<String, Object> registerUser(@RequestBody RegisterRequest request) {

                Long userId = userService.registerUser(request);
                return Map.of("message", "User registered successfully", "userId", userId);
    }


        @PostMapping("/login")
        public Map<String, Object> loginUser(@RequestBody LoginRequest request) {
           String userLogin = userService.loginUser(request);

           return Map.of(
            "message", "Login successful",
            "token", userLogin
            );
        }

        @GetMapping("/profile/{id}")
        public ProfileRequest getUserProfile(@PathVariable Long id, Principal principal) {
             return userService.getUserProfile(id);
}
}
