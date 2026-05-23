package com.splititup.backend.auth.dto;

import com.splititup.backend.auth.entity.Role;

import java.util.UUID;

public record AuthUserResponse(
        UUID id,
        String name,
        String email,
        Role role
) {
}
