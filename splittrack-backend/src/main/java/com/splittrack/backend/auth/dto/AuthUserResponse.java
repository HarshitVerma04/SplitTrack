package com.splittrack.backend.auth.dto;

import com.splittrack.backend.auth.entity.Role;

import java.util.UUID;

public record AuthUserResponse(
        UUID id,
        String name,
        String email,
        Role role
) {
}
