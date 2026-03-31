package com.splittrack.backend.app.service;

import com.splittrack.backend.app.dto.AppStateResponse;
import com.splittrack.backend.app.entity.Expense;
import com.splittrack.backend.app.entity.ExpenseSplit;
import com.splittrack.backend.app.entity.GroupEntity;
import com.splittrack.backend.app.entity.GroupMember;
import com.splittrack.backend.app.entity.SettlementRequest;
import com.splittrack.backend.app.entity.SettlementStatus;
import com.splittrack.backend.app.entity.SplitType;
import com.splittrack.backend.app.repository.ExpenseRepository;
import com.splittrack.backend.app.repository.GroupRepository;
import com.splittrack.backend.app.repository.SettlementRequestRepository;
import com.splittrack.backend.auth.entity.User;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AppStateService {

    private static final DateTimeFormatter LEDGER_DATE_FORMAT = DateTimeFormatter.ofPattern("dd-MM-yyyy");

    private final GroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;
    private final SettlementRequestRepository settlementRequestRepository;

    public AppStateService(
            GroupRepository groupRepository,
            ExpenseRepository expenseRepository,
            SettlementRequestRepository settlementRequestRepository
    ) {
        this.groupRepository = groupRepository;
        this.expenseRepository = expenseRepository;
        this.settlementRequestRepository = settlementRequestRepository;
    }

    public AppStateResponse build(User currentUser) {
        UUID currentUserId = currentUser.getId();
        List<GroupEntity> groups = groupRepository.findDistinctByMembersUserIdOrderByCreatedAtDesc(currentUserId);
        List<Expense> expenses = expenseRepository.findDistinctByGroupMembersUserIdOrderByCreatedAtDesc(currentUserId);
        List<SettlementRequest> settlements = settlementRequestRepository
                .findTop10ByFromUserIdOrToUserIdOrderByCreatedAtDesc(currentUserId, currentUserId);

        BigDecimal totalOwed = BigDecimal.ZERO;
        BigDecimal totalYouOwe = BigDecimal.ZERO;
        Map<UUID, BigDecimal> groupBalance = new LinkedHashMap<>();

        for (Expense expense : expenses) {
            BigDecimal yourShare = userShare(expense, currentUserId);
            UUID payerId = expense.getPayer().getId();

            if (payerId.equals(currentUserId)) {
                BigDecimal owed = expense.getTotalAmount().subtract(yourShare);
                totalOwed = totalOwed.add(owed);
                groupBalance.merge(expense.getGroup().getId(), owed, BigDecimal::add);
            } else if (yourShare.compareTo(BigDecimal.ZERO) > 0) {
                totalYouOwe = totalYouOwe.add(yourShare);
                groupBalance.merge(expense.getGroup().getId(), yourShare.negate(), BigDecimal::add);
            }
        }

        BigDecimal totalNet = totalOwed.subtract(totalYouOwe);

        List<AppStateResponse.ActivityItem> activityItems = expenses.stream()
                .limit(6)
                .map(expense -> toActivityItem(expense, currentUserId))
                .toList();

        List<AppStateResponse.GroupItem> groupItems = groups.stream()
                .map(group -> {
                    BigDecimal balance = groupBalance.getOrDefault(group.getId(), BigDecimal.ZERO);
                    return new AppStateResponse.GroupItem(
                            group.getId().toString(),
                            group.getName(),
                            group.getMembers().size(),
                            formatSignedCurrency(balance),
                            balanceTone(balance),
                            balanceStatus(balance)
                    );
                })
                .toList();

        GroupEntity primaryGroup = groups.isEmpty() ? null : groups.getFirst();
        AppStateResponse.GroupLedgerSection ledgerSection = buildGroupLedger(primaryGroup, currentUserId);

        List<AppStateResponse.NotificationItem> notificationItems = settlements.stream()
                .limit(6)
                .map(s -> {
                    boolean incoming = s.getToUser().getId().equals(currentUserId);
                    String title = incoming
                            ? "Settlement request from " + s.getFromUser().getName()
                            : "Pending settlement to " + s.getToUser().getName();
                    String priority = incoming ? "high" : "normal";
                    return new AppStateResponse.NotificationItem(
                            s.getId().toString(),
                            title,
                            humanTime(s.getCreatedAt()),
                            priority
                    );
                })
                .toList();

        List<AppStateResponse.SettlementItem> settlementItems = settlements.stream()
                .map(s -> new AppStateResponse.SettlementItem(
                        s.getId().toString(),
                        s.getFromUser().getName(),
                        s.getToUser().getName(),
                        s.getAmount().longValue(),
                        settlementStatusLabel(s)
                ))
                .toList();

        List<AppStateResponse.OneOnOneItem> oneOnOneItems = expenses.stream()
                .filter(this::hasExactlyTwoParticipants)
                .limit(8)
                .map(expense -> new AppStateResponse.OneOnOneItem(
                        expense.getId().toString(),
                        expense.getTitle(),
                        expense.getTotalAmount().longValue(),
                        userShare(expense, currentUserId).longValue(),
                        expense.getCreatedAt().toLocalDate().format(LEDGER_DATE_FORMAT)
                ))
                .toList();

        AppStateResponse.AnalyticsSection analytics = buildAnalytics(expenses, currentUserId);

        AppStateResponse.ExpenseDetailSection expenseDetail = new AppStateResponse.ExpenseDetailSection(
                expenses.isEmpty()
                        ? null
                        : new AppStateResponse.ExpenseDetail(
                                expenses.getFirst().getId().toString(),
                                expenses.getFirst().getTitle(),
                                "Paid by " + expenses.getFirst().getPayer().getName()
                                        + " • Total " + formatCurrency(expenses.getFirst().getTotalAmount())
                                        + " • Split " + splitTypeLabel(expenses.getFirst()),
                                List.of()
                        )
        );

        return new AppStateResponse(
                new AppStateResponse.ProfileSummary(currentUser.getName(), currentUser.getEmail()),
                new AppStateResponse.DashboardSection(
                        formatCurrency(totalNet),
                        totalNet.compareTo(BigDecimal.ZERO) == 0 ? "No transactions yet" : "Calculated from your current balances",
                        formatCurrency(totalOwed),
                        totalOwed.compareTo(BigDecimal.ZERO) == 0 ? "No receivables yet" : "People owe you across active groups",
                        formatCurrency(totalYouOwe),
                        totalYouOwe.compareTo(BigDecimal.ZERO) == 0 ? "No payables yet" : "You owe others across active groups",
                        activityItems,
                        groupItems
                ),
                ledgerSection,
                new AppStateResponse.NotificationSection(notificationItems),
                new AppStateResponse.SettlementSection(settlementItems),
                new AppStateResponse.OneOnOneSection(oneOnOneItems),
                analytics,
                new AppStateResponse.ExportSection(List.of()),
                expenseDetail
        );
    }

    private AppStateResponse.GroupLedgerSection buildGroupLedger(GroupEntity group, UUID currentUserId) {
        if (group == null) {
            return new AppStateResponse.GroupLedgerSection(
                    "No Active Group Yet",
                    "No dates yet",
                    "₹0.00",
                    List.of(),
                    List.of()
            );
        }

        List<Expense> groupExpenses = expenseRepository.findByGroupIdOrderByCreatedAtDesc(group.getId());
        BigDecimal groupTotal = groupExpenses.stream()
                .map(Expense::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<UUID, BigDecimal> memberBalances = new HashMap<>();
        for (Expense expense : groupExpenses) {
            UUID payerId = expense.getPayer().getId();
            for (ExpenseSplit split : expense.getSplits()) {
                UUID splitUserId = split.getUser().getId();
                if (payerId.equals(currentUserId) && !splitUserId.equals(currentUserId)) {
                    memberBalances.merge(splitUserId, split.getAmount(), BigDecimal::add);
                }
                if (!payerId.equals(currentUserId) && splitUserId.equals(currentUserId)) {
                    memberBalances.merge(payerId, split.getAmount().negate(), BigDecimal::add);
                }
            }
        }

        List<AppStateResponse.GroupMember> members = group.getMembers().stream()
                .map(GroupMember::getUser)
                .filter(u -> !u.getId().equals(currentUserId))
                .map(user -> {
                    BigDecimal balance = memberBalances.getOrDefault(user.getId(), BigDecimal.ZERO);
                    String status = balanceStatus(balance);
                    String amount = balance.compareTo(BigDecimal.ZERO) == 0
                            ? "Settled"
                            : formatSignedCurrency(balance);
                    return new AppStateResponse.GroupMember(
                            user.getId().toString(),
                            user.getName(),
                            status,
                            amount,
                            balanceTone(balance)
                    );
                })
                .toList();

        Map<LocalDate, List<Expense>> byDay = groupExpenses.stream()
                .collect(Collectors.groupingBy(expense -> expense.getCreatedAt().toLocalDate(), LinkedHashMap::new, Collectors.toList()));

        List<AppStateResponse.LedgerDay> ledgerDays = byDay.entrySet().stream()
                .map(entry -> {
                    List<AppStateResponse.LedgerRow> rows = entry.getValue().stream()
                            .map(expense -> new AppStateResponse.LedgerRow(
                                    expense.getId().toString(),
                                    expense.getTitle(),
                                    expense.getCategory(),
                                    expense.getPayer().getName(),
                                    splitTypeLabel(expense),
                                    formatCurrency(userShare(expense, currentUserId)),
                                    formatCurrency(expense.getTotalAmount())
                            ))
                            .toList();
                    return new AppStateResponse.LedgerDay(entry.getKey().format(LEDGER_DATE_FORMAT), rows);
                })
                .toList();

        String dateRange = groupExpenses.isEmpty()
                ? "No dates yet"
                : groupExpenses.getLast().getCreatedAt().toLocalDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"))
                + " - " + groupExpenses.getFirst().getCreatedAt().toLocalDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));

        return new AppStateResponse.GroupLedgerSection(
                group.getName(),
                dateRange,
                formatCurrency(groupTotal),
                members,
                ledgerDays
        );
    }

    private AppStateResponse.AnalyticsSection buildAnalytics(List<Expense> expenses, UUID currentUserId) {
        BigDecimal monthlySpend = expenses.stream()
                .filter(expense -> expense.getCreatedAt().getMonth() == OffsetDateTime.now().getMonth())
                .map(expense -> userShare(expense, currentUserId))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> byCategory = new HashMap<>();
        for (Expense expense : expenses) {
            byCategory.merge(expense.getCategory(), userShare(expense, currentUserId), BigDecimal::add);
        }
        String topCategory = byCategory.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        Map<String, BigDecimal> payerTotals = new HashMap<>();
        for (Expense expense : expenses) {
            payerTotals.merge(expense.getPayer().getName(), expense.getTotalAmount(), BigDecimal::add);
        }
        String highestContributor = payerTotals.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");

        return new AppStateResponse.AnalyticsSection(List.of(
                new AppStateResponse.AnalyticsCard("Monthly Spend", formatCurrency(monthlySpend)),
                new AppStateResponse.AnalyticsCard("Top Category", topCategory),
                new AppStateResponse.AnalyticsCard("Highest Contributor", highestContributor)
        ));
    }

    private AppStateResponse.ActivityItem toActivityItem(Expense expense, UUID currentUserId) {
        BigDecimal yourShare = userShare(expense, currentUserId);
        boolean payerIsCurrent = expense.getPayer().getId().equals(currentUserId);
        BigDecimal signed = payerIsCurrent
                ? expense.getTotalAmount().subtract(yourShare)
                : yourShare.negate();

        return new AppStateResponse.ActivityItem(
                expense.getId().toString(),
                expense.getTitle(),
                expense.getGroup().getName(),
                formatSignedCurrency(signed),
                humanTime(expense.getCreatedAt()),
                balanceTone(signed)
        );
    }

    private BigDecimal userShare(Expense expense, UUID userId) {
        return expense.getSplits().stream()
                .filter(split -> split.getUser().getId().equals(userId))
                .map(ExpenseSplit::getAmount)
                .findFirst()
                .orElse(BigDecimal.ZERO);
    }

    private boolean hasExactlyTwoParticipants(Expense expense) {
        return expense.getSplits().size() == 2;
    }

    private String formatCurrency(BigDecimal value) {
        NumberFormat formatter = NumberFormat.getNumberInstance(Locale.forLanguageTag("en-IN"));
        formatter.setMinimumFractionDigits(2);
        formatter.setMaximumFractionDigits(2);
        return "₹" + formatter.format(value.setScale(2, RoundingMode.HALF_UP));
    }

    private String formatSignedCurrency(BigDecimal value) {
        BigDecimal absolute = value.abs().setScale(2, RoundingMode.HALF_UP);
        if (value.compareTo(BigDecimal.ZERO) == 0) {
            return "₹0.00";
        }
        return (value.compareTo(BigDecimal.ZERO) > 0 ? "+ " : "- ") + formatCurrency(absolute);
    }

    private String balanceTone(BigDecimal value) {
        if (value.compareTo(BigDecimal.ZERO) > 0) {
            return "text-[#15803d] dark:text-[#4ade80]";
        }
        if (value.compareTo(BigDecimal.ZERO) < 0) {
            return "text-[#b42318] dark:text-[#f87171]";
        }
        return "text-[#4b4451]";
    }

    private String balanceStatus(BigDecimal value) {
        if (value.compareTo(BigDecimal.ZERO) > 0) {
            return "Owes you";
        }
        if (value.compareTo(BigDecimal.ZERO) < 0) {
            return "You owe";
        }
        return "All clear";
    }

    private String humanTime(OffsetDateTime createdAt) {
        return createdAt.toLocalDate().format(DateTimeFormatter.ofPattern("dd MMM"));
    }

        private String splitTypeLabel(Expense expense) {
                return expense.getSplitType() == null ? SplitType.EXACT.name() : expense.getSplitType().name();
        }

        private String settlementStatusLabel(SettlementRequest settlement) {
                return settlement.getStatus() == null ? SettlementStatus.PENDING.name() : settlement.getStatus().name();
        }
}
