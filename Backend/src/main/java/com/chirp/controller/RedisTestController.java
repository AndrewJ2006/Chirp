package com.chirp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/redis-test")
public class RedisTestController {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @PostMapping("/set")
    @PreAuthorize("permitAll()")
    public ResponseEntity<String> set(@RequestParam String key, @RequestParam String value) {
        try {
            redisTemplate.opsForValue().set(key, value);
            return ResponseEntity.ok("Key '" + key + "' set successfully with value: " + value);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/get")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Object> get(@RequestParam String key) {
        try {
            Object value = redisTemplate.opsForValue().get(key);
            if (value == null) {
                return ResponseEntity.status(404).body("Key '" + key + "' not found");
            }
            return ResponseEntity.ok(value);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete")
    @PreAuthorize("permitAll()")
    public ResponseEntity<String> delete(@RequestParam String key) {
        try {
            Boolean deleted = redisTemplate.delete(key);
            if (deleted != null && deleted) {
                return ResponseEntity.ok("Key '" + key + "' deleted successfully");
            } else {
                return ResponseEntity.status(404).body("Key '" + key + "' not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/ping")
    @PreAuthorize("permitAll()")
    public ResponseEntity<String> ping() {
        try {
            // Try to ping Redis
            if (redisTemplate.getConnectionFactory() == null) {
                return ResponseEntity.status(500).body("Redis connection factory not initialized");
            }
            
            var connection = redisTemplate.getConnectionFactory().getConnection();
            if (connection == null) {
                return ResponseEntity.status(500).body("Could not get Redis connection");
            }
            
            connection.ping();
            return ResponseEntity.ok("Redis is connected and working!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Redis connection failed: " + e.getClass().getSimpleName() + " - " + e.getMessage());
        }
    }
}
