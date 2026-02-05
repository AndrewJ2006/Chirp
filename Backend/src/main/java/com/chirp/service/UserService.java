package com.chirp.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.chirp.config.CustomUserDetails;
import com.chirp.config.JwtService;
import com.chirp.config.UserDetailsImpl;
import com.chirp.dto.LoginRequest;
import com.chirp.dto.ProfileRequest;
import com.chirp.dto.RegisterRequest;
import com.chirp.model.User;
import com.chirp.repository.UserRepo;



@Service
public class UserService implements UserDetailsService {
 
private final UserRepo userRepository;
private final PasswordEncoder passwordEncoder;
private final JwtService jwtService;

    public UserService(UserRepo userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }


    public Long registerUser(RegisterRequest request) {

        validateUsernameAndEmail(request);

       String hashedPassword = passwordEncoder.encode(request.getPassword());

       User user = new User();
       user.setEmail(request.getEmail());
       user.setUsername(request.getUsername());
       user.setPassword(hashedPassword);
       user.setCreatedAt(LocalDateTime.now());


       User savedUser = userRepository.save(user);
       return savedUser.getId();

    }




    public String loginUser(LoginRequest request) {

        User user = null;

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            user = userRepository.findByEmail(request.getEmail()).orElse(null);
        }

        if (user == null && request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
            user = userRepository.findByUsername(request.getUsername()).orElse(null);
        }

        if (user == null) {
            throw new IllegalArgumentException("User does not exist");
        }

        boolean match = passwordEncoder.matches(request.getPassword(), user.getPassword());     

        if (!match) {
            throw new IllegalArgumentException("Wrong Password");
        }

        
        return jwtService.generateToken(user.getUsername());
    }


   public ProfileRequest getUserProfile(Long id) {

    Optional<User> user1 = userRepository.findById(id);


    User user2;

    if (user1.isPresent()) {
        user2 = user1.get();
    } else {
        throw new IllegalArgumentException("No user");
    }
    ProfileRequest profile = new ProfileRequest();

    profile.setEmail(user2.getEmail());
    profile.setUsername(user2.getUsername());
    profile.setCreatedAt(user2.getCreatedAt());
    profile.setId(user2.getId());

    return profile;
   

   }

   public void validateUsernameAndEmail(RegisterRequest request) {

         if (request.getUsername().length() == 0) {
             throw new IllegalArgumentException("Please fill in username");
       
            }
         if (request.getEmail().length() == 0) {
            throw new IllegalArgumentException("Please fill in email");
        }

                                                                    
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }

         if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

   }

   public Optional<User> findById(Long id) {
    return userRepository.findById(id);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }

    public List<ProfileRequest> searchUsers(String query) {
        List<User> users = userRepository.searchUsers(query);
        return users.stream()
            .map(user -> {
                ProfileRequest profile = new ProfileRequest();
                profile.setId(user.getId());
                profile.setUsername(user.getUsername());
                profile.setEmail(user.getEmail());
                profile.setCreatedAt(user.getCreatedAt());
                return profile;
            })
            .collect(Collectors.toList());
    }


    //for JWT, spring secuirty for user
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return new UserDetailsImpl(user);

    }
}


