package com.chirp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class PostController {
    
@GetMapping("/test")
public String test() {
    return "Server is running";
}


}
