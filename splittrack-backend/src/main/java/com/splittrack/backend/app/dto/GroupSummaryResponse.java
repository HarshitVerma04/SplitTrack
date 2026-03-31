package com.splittrack.backend.app.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record GroupSummaryResponse(
        UUID id,
        String name,
        String description,
        int memberCount,
        OffsetDateTime createdAt
) {
}
