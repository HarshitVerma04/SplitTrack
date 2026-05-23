package com.splititup.backend.app.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record UpdateSettlementStatusRequest(
        @NotBlank String status,
        @DecimalMin("0.01") BigDecimal amount
) {
}
