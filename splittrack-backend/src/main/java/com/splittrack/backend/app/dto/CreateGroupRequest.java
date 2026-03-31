package com.splittrack.backend.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record CreateGroupRequest(
        @NotBlank @Size(max = 140) String name,
        @Size(max = 400) String description,
        List<UUID> memberIds
) {
}
