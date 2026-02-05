package com.chirp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import jakarta.validation.ConstraintViolationException;

@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    // 400 Bad Request
    @ExceptionHandler({ IllegalArgumentException.class, ConstraintViolationException.class })
    public ResponseEntity<String> handleBadRequest(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body("Bad Request: " + ex.getMessage());
    }

    // 401 Unauthorized
    @ExceptionHandler({ SecurityException.class })
    public ResponseEntity<String> handleUnauthorized(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("Unauthorized: " + ex.getMessage());
    }

    // 404 Not Found
    @ExceptionHandler({ ResourceNotFoundException.class, UserNotFoundException.class })
    public ResponseEntity<String> handleNotFound(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body("Not Found: " + ex.getMessage());
    }

    // 409 Conflict
    @ExceptionHandler({ IllegalStateException.class })
    public ResponseEntity<String> handleConflict(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body("Conflict: " + ex.getMessage());
    }

    // 500 Internal Server Error (fallback)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleAll(Exception ex) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Internal Server Error: " + ex.getMessage());
    }
}