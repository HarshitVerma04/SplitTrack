package com.splittrack.backend.app.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ExpenseSummaryResponse(
        UUID id,
        UUID groupId,
        String title,
        String category,
        BigDecimal totalAmount,
        UUID payerId,
        OffsetDateTime createdAt
) {
}
