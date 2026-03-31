package com.splittrack.backend.app.controller;

import com.splittrack.backend.app.dto.CreateSettlementRequest;
import com.splittrack.backend.app.dto.SettlementSummaryResponse;
import com.splittrack.backend.app.dto.UpdateSettlementStatusRequest;
import com.splittrack.backend.app.service.AppCommandService;
import com.splittrack.backend.auth.entity.User;
import com.splittrack.backend.common.exception.AppException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settlements")
public class SettlementController {

    private final AppCommandService appCommandService;

    public SettlementController(AppCommandService appCommandService) {
        this.appCommandService = appCommandService;
    }

    @PostMapping
    public ResponseEntity<SettlementSummaryResponse> create(@Valid @RequestBody CreateSettlementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appCommandService.createSettlement(currentUser(), request));
    }

    @PatchMapping("/{settlementId}/status")
    public ResponseEntity<SettlementSummaryResponse> updateStatus(
            @PathVariable java.util.UUID settlementId,
            @Valid @RequestBody UpdateSettlementStatusRequest request
    ) {
        return ResponseEntity.ok(appCommandService.updateSettlementStatus(currentUser(), settlementId, request.status()));
    }

    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof User user)) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return user;
    }
}
