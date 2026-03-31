package com.splittrack.backend.app.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateSettlementStatusRequest(@NotBlank String status) {
}
