package com.chirp.service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.chirp.config.JwtService;
import com.chirp.model.User;
import com.chirp.repository.UserRepo;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

@Service
public class OAuthService {

    private final UserRepo userRepo;
    private final JwtService jwtService;

    @Value("${oauth.google.client-id:}")
    private String googleClientId;

    @Value("${oauth.apple.client-id:}")
    private String appleClientId;

    public OAuthService(UserRepo userRepo, JwtService jwtService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
    }

    public String authenticateWithGoogle(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), 
                GsonFactory.getDefaultInstance()
            )
            .setAudience(Collections.singletonList(googleClientId))
            .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new IllegalArgumentException("Invalid Google ID token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String googleUserId = payload.getSubject();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            // Find or create user
            User user = findOrCreateOAuthUser(googleUserId, email, name, pictureUrl, "google");
            
            // Generate JWT
            return jwtService.generateToken(user.getUsername());

        } catch (GeneralSecurityException | IOException e) {
            throw new IllegalArgumentException("Failed to verify Google token: " + e.getMessage());
        }
    }

    public String authenticateWithApple(String idTokenString) {
        try {
            // Apple ID token verification
            // Note: This is a simplified version. For production, use Apple's public keys
            // and verify the JWT signature properly
            
            com.auth0.jwt.interfaces.DecodedJWT jwt = com.auth0.jwt.JWT.decode(idTokenString);
            
            // Verify audience
            if (!jwt.getAudience().contains(appleClientId)) {
                throw new IllegalArgumentException("Invalid Apple ID token audience");
            }

            String appleUserId = jwt.getSubject();
            String email = jwt.getClaim("email").asString();
            String name = email.split("@")[0]; // Apple doesn't always provide name
            
            // Find or create user
            User user = findOrCreateOAuthUser(appleUserId, email, name, null, "apple");
            
            // Generate JWT
            return jwtService.generateToken(user.getUsername());

        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to verify Apple token: " + e.getMessage());
        }
    }

    private User findOrCreateOAuthUser(String oauthId, String email, String name, String pictureUrl, String provider) {
        // First, try to find by OAuth provider ID
        Optional<User> existingUser = userRepo.findByOauthProviderAndOauthProviderId(provider, oauthId);
        
        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        // Check if email already exists (user might have registered normally)
        Optional<User> userByEmail = userRepo.findByEmail(email);
        if (userByEmail.isPresent()) {
            // Link OAuth to existing account
            User user = userByEmail.get();
            user.setOauthProvider(provider);
            user.setOauthProviderId(oauthId);
            if (pictureUrl != null && user.getProfilePictureUrl() == null) {
                user.setProfilePictureUrl(pictureUrl);
            }
            return userRepo.save(user);
        }

        // Create new user
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setUsername(generateUniqueUsername(name, email));
        newUser.setPassword(null); // No password for OAuth users
        newUser.setOauthProvider(provider);
        newUser.setOauthProviderId(oauthId);
        newUser.setProfilePictureUrl(pictureUrl);
        newUser.setCreatedAt(LocalDateTime.now());
        
        return userRepo.save(newUser);
    }

    private String generateUniqueUsername(String name, String email) {
        // Clean up name to create username
        String baseUsername = name != null ? name.toLowerCase().replaceAll("[^a-z0-9]", "") : 
                             email.split("@")[0].toLowerCase().replaceAll("[^a-z0-9]", "");
        
        if (baseUsername.isEmpty()) {
            baseUsername = "user";
        }

        String username = baseUsername;
        int counter = 1;
        
        // Ensure username is unique
        while (userRepo.findByUsername(username).isPresent()) {
            username = baseUsername + counter;
            counter++;
        }
        
        return username;
    }
}
