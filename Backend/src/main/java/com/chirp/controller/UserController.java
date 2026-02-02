package com.chirp.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.security.Principal;

import com.chirp.dto.LoginRequest;
import com.chirp.dto.ProfileRequest;
import com.chirp.dto.RegisterRequest;
import com.chirp.service.UserService;

@RestController
@RequestMapping("/users") 
@Tag(name = "Users", description = "User registration, login, and profiles")
public class UserController {

    private final UserService userService;

        public UserController(UserService userService) {
            this.userService = userService;
        }
    

         @PostMapping("/register")
         @Operation(summary = "Register a new user")
         public Map<String, Object> registerUser(@RequestBody RegisterRequest request) {

                Long userId = userService.registerUser(request);
                return Map.of("message", "User registered successfully", "userId", userId);
    }


        @PostMapping("/login")
        @Operation(summary = "Login and receive a JWT")
        public Map<String, Object> loginUser(@RequestBody LoginRequest request) {
           String userLogin = userService.loginUser(request);

           return Map.of(
            "message", "Login successful",
            "token", userLogin
            );
        }

        @GetMapping("/profile/{id}")
        @Operation(summary = "Get a user profile")
        public ProfileRequest getUserProfile(@PathVariable Long id, Principal principal) {
             return userService.getUserProfile(id);
}
}
