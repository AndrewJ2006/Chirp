package com.chirp.dto;

public class OAuthLoginRequest {
    private String idToken;

    public OAuthLoginRequest() {
    }

    public OAuthLoginRequest(String idToken) {
        this.idToken = idToken;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
}
