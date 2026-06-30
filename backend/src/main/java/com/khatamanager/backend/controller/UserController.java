package com.khatamanager.backend.controller;

import com.khatamanager.backend.dto.UserDto;
import com.khatamanager.backend.model.User;
import com.khatamanager.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UserDto request, Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body("Email is already taken");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getName() != null) user.setName(request.getName());
        if (request.getShopName() != null) user.setShopName(request.getShopName());
        
        User savedUser = userRepository.save(user);
        
        UserDto userDto = new UserDto(savedUser.getId(), savedUser.getName(), savedUser.getShopName(), savedUser.getEmail());
        return ResponseEntity.ok(userDto);
    }
}
