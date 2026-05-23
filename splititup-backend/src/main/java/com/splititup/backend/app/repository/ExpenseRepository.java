package com.splititup.backend.app.repository;

import com.splititup.backend.app.entity.Expense;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    @EntityGraph(attributePaths = {"payer", "group", "splits", "splits.user"})
    List<Expense> findDistinctByGroupMembersUserIdOrderByCreatedAtDesc(UUID userId);

    @EntityGraph(attributePaths = {"payer", "group", "splits", "splits.user"})
    List<Expense> findByGroupIdOrderByCreatedAtDesc(UUID groupId);

    @EntityGraph(attributePaths = {"payer", "group", "splits", "splits.user"})
    Optional<Expense> findTopByGroupMembersUserIdOrderByCreatedAtDesc(UUID userId);

    @EntityGraph(attributePaths = {"payer", "group", "splits", "splits.user"})
    Optional<Expense> findByIdAndGroupMembersUserId(UUID expenseId, UUID userId);
}
