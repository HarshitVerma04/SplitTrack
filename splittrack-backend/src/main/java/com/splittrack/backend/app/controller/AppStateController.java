package com.splittrack.backend.app.controller;

import com.splittrack.backend.app.dto.AppStateResponse;
import com.splittrack.backend.app.service.AppStateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.splittrack.backend.common.security.SecurityUtils.currentUser;

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
}
