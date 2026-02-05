package com.chirp.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chirp.dto.OAuthLoginRequest;
import com.chirp.service.OAuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/oauth")
@Tag(name = "OAuth", description = "OAuth authentication with Google and Apple")
public class OAuthController {

    private final OAuthService oauthService;

    public OAuthController(OAuthService oauthService) {
        this.oauthService = oauthService;
    }

    @PostMapping("/google")
    @Operation(summary = "Authenticate with Google OAuth token")
    public Map<String, Object> googleLogin(@RequestBody OAuthLoginRequest request) {
        String jwtToken = oauthService.authenticateWithGoogle(request.getIdToken());
        return Map.of(
            "message", "Login successful",
            "token", jwtToken
        );
    }

    @PostMapping("/apple")
    @Operation(summary = "Authenticate with Apple OAuth token")
    public Map<String, Object> appleLogin(@RequestBody OAuthLoginRequest request) {
        String jwtToken = oauthService.authenticateWithApple(request.getIdToken());
        return Map.of(
            "message", "Login successful",
            "token", jwtToken
        );
    }
}
