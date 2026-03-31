package com.splittrack.backend.app.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record AddGroupMembersRequest(
        @NotEmpty List<@NotNull UUID> memberIds
) {
}