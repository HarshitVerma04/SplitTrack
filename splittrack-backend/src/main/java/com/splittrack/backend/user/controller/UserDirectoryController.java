package com.splittrack.backend.user.controller;

import com.splittrack.backend.auth.entity.User;
import com.splittrack.backend.auth.repository.UserRepository;
import com.splittrack.backend.common.exception.AppException;
import com.splittrack.backend.user.dto.UserDirectoryItem;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserDirectoryController {

    private final UserRepository userRepository;

    public UserDirectoryController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<UserDirectoryItem>> list() {
        User currentUser = currentUser();
        List<UserDirectoryItem> users = userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .map(user -> new UserDirectoryItem(user.getId(), user.getName(), user.getEmail()))
                .toList();
        return ResponseEntity.ok(users);
    }

    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof User user)) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return user;
    }
}
