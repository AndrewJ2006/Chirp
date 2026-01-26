package com.chirp.service;

import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.chirp.Config.JwtService;
import com.chirp.dto.LoginRequest;
import com.chirp.dto.RegisterRequest;
import com.chirp.model.User;
import com.chirp.repository.UserRepository;



@Service
public class UserService {
 
private final UserRepository userRepository;
private final PasswordEncoder passwordEncoder;
private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }


    public Long registerUser(RegisterRequest request) {

        if (request.getUsername().length() == 0) {
            throw new IllegalArgumentException("Pls fill in username");
        }
         if (request.getEmail().length() == 0) {
            throw new IllegalArgumentException("Pls fill in email");
        }

                                                                    //returns boolean
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }

         if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }


       String hashedPassword = passwordEncoder.encode(request.getPassword());

       User user = new User();
       user.setEmail(request.getEmail());
       user.setUsername(request.getUsername());
       user.setPassword(hashedPassword);


       User savedUser = userRepository.save(user);
       return savedUser.getId();

    }




    public String loginUser(LoginRequest request) {


        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        Optional<User> optionalUser2 = userRepository.findByUsername(request.getUsername());

        if (optionalUser.isEmpty() && optionalUser2.isEmpty()) {
            throw new IllegalArgumentException("User does not exist");
        } 

        User user;

        if (optionalUser.isPresent()) {
             user = optionalUser.get();
        } else {
             user = optionalUser2.get();
        }


        boolean match = passwordEncoder.matches(request.getPassword(), user.getPassword());     

        if (!match) {
            throw new IllegalArgumentException("Wrong Password");
        }

        //JWT
        return jwtService.generateToken(user.getUsername());
    }

}


