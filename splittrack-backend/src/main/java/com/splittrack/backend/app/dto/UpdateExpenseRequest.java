package com.splittrack.backend.app.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record UpdateExpenseRequest(
        @Size(max = 180) String title,
        @Size(max = 80) String category,
        @DecimalMin("0.01") BigDecimal totalAmount,
        UUID payerId,
        List<@Valid CreateExpenseRequest.ExpenseSplitInput> splits
) {
}