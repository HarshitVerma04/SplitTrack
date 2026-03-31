package com.splittrack.backend.app.controller;

import com.splittrack.backend.app.dto.AppStateResponse;
import com.splittrack.backend.app.service.AppStateService;
import com.splittrack.backend.auth.entity.User;
import com.splittrack.backend.common.exception.AppException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/app")
public class AppStateController {

    private final AppStateService appStateService;

    public AppStateController(AppStateService appStateService) {
        this.appStateService = appStateService;
    }

    @GetMapping("/state")
    public ResponseEntity<AppStateResponse> state() {
        return ResponseEntity.ok(appStateService.build(currentUser()));
    }

    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof User user)) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return user;
    }
}
