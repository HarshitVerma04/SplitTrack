package com.splittrack.backend.user.dto;

import java.util.UUID;

public record UserDirectoryItem(UUID id, String name, String email) {
}
