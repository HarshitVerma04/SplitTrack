package com.splittrack.backend.app.controller;

import com.splittrack.backend.app.dto.CreateExpenseRequest;
import com.splittrack.backend.app.dto.ExpenseSummaryResponse;
import com.splittrack.backend.app.dto.UpdateExpenseRequest;
import com.splittrack.backend.app.service.AppCommandService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.splittrack.backend.common.security.SecurityUtils.currentUser;

@RestController
@RequestMapping("/api/v1/expenses")
public class ExpenseController {

    private final AppCommandService appCommandService;

    public ExpenseController(AppCommandService appCommandService) {
        this.appCommandService = appCommandService;
    }

    @PostMapping
    public ResponseEntity<ExpenseSummaryResponse> create(@Valid @RequestBody CreateExpenseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(appCommandService.createExpense(currentUser(), request));
    }

    @PatchMapping("/{expenseId}")
    public ResponseEntity<ExpenseSummaryResponse> update(
            @PathVariable java.util.UUID expenseId,
            @Valid @RequestBody UpdateExpenseRequest request
    ) {
        return ResponseEntity.ok(appCommandService.updateExpense(currentUser(), expenseId, request));
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> delete(@PathVariable java.util.UUID expenseId) {
        appCommandService.deleteExpense(currentUser(), expenseId);
        return ResponseEntity.noContent().build();
    }
}
