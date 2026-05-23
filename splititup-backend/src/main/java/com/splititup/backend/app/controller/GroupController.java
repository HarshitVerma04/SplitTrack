package com.splititup.backend.app.controller;

import com.splititup.backend.app.dto.CreateGroupRequest;
import com.splititup.backend.app.dto.GroupSummaryResponse;
import com.splititup.backend.app.dto.AddGroupMembersRequest;
import com.splititup.backend.app.service.AppCommandService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.splititup.backend.common.security.SecurityUtils.currentUser;

@RestController
@RequestMapping("/api/v1/groups")
public class GroupController {

    private final AppCommandService appCommandService;

    public GroupController(AppCommandService appCommandService) {
        this.appCommandService = appCommandService;
    }

    @PostMapping
    public ResponseEntity<GroupSummaryResponse> create(@Valid @RequestBody CreateGroupRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appCommandService.createGroup(currentUser(), request));
    }

    @GetMapping
    public ResponseEntity<List<GroupSummaryResponse>> list() {
        return ResponseEntity.ok(appCommandService.listGroups(currentUser()));
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> delete(@PathVariable java.util.UUID groupId) {
        appCommandService.deleteGroup(currentUser(), groupId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{groupId}/members")
    public ResponseEntity<GroupSummaryResponse> addMembers(
            @PathVariable java.util.UUID groupId,
            @Valid @RequestBody AddGroupMembersRequest request
    ) {
        return ResponseEntity.ok(appCommandService.addMembers(currentUser(), groupId, request.memberIds()));
    }

    @DeleteMapping("/{groupId}/members/{memberId}")
    public ResponseEntity<GroupSummaryResponse> removeMember(
            @PathVariable java.util.UUID groupId,
            @PathVariable java.util.UUID memberId
    ) {
        return ResponseEntity.ok(appCommandService.removeMember(currentUser(), groupId, memberId));
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<List<com.splititup.backend.user.dto.UserDirectoryItem>> listMembers(
            @PathVariable java.util.UUID groupId
    ) {
        return ResponseEntity.ok(appCommandService.listGroupMembers(currentUser(), groupId));
    }
}
