package com.splittrack.backend.app.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record SettlementSummaryResponse(
        UUID id,
        UUID fromUserId,
        UUID toUserId,
        BigDecimal amount,
        String status,
        OffsetDateTime createdAt
) {
}
