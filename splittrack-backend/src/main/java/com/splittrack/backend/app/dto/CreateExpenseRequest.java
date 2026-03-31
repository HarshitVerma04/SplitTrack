package com.splittrack.backend.app.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateExpenseRequest(
        @NotNull UUID groupId,
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 80) String category,
        @NotNull @DecimalMin("0.01") BigDecimal totalAmount,
        UUID payerId,
        @NotEmpty List<@Valid ExpenseSplitInput> splits
) {
    public record ExpenseSplitInput(
            @NotNull UUID userId,
            @NotNull @DecimalMin("0.00") BigDecimal amount
    ) {
    }
}
