package com.splittrack.backend.app.dto;

import java.util.List;

public record AppStateResponse(
        ProfileSummary profile,
        DashboardSection dashboard,
        GroupLedgerSection groupLedger,
        NotificationSection notifications,
        SettlementSection settlements,
        OneOnOneSection oneOnOne,
        AnalyticsSection analytics,
        ExportSection exports,
        ExpenseDetailSection expenseDetail
) {
    public record ProfileSummary(String name, String email) {
    }

    public record DashboardSection(
            String totalNetBalance,
            String totalNetBalanceNote,
            String youAreOwed,
            String youAreOwedNote,
            String youOwe,
            String youOweNote,
            List<ActivityItem> recentActivity,
            List<GroupItem> groups
    ) {
    }

    public record ActivityItem(
            String id,
            String title,
            String group,
            String amount,
            String time,
            String tone
    ) {
    }

    public record GroupItem(
            String id,
            String name,
            int members,
            String spend,
            String spendTone,
            String status
    ) {
    }

    public record GroupLedgerSection(
            String title,
            String dateRange,
            String totalGroupSpending,
            List<GroupMember> members,
            List<LedgerDay> ledgerDays
    ) {
    }

    public record GroupMember(String id, String name, String status, String amount, String tone) {
    }

    public record LedgerDay(String date, List<LedgerRow> rows) {
    }

    public record LedgerRow(
            String id,
            String title,
            String category,
            String payer,
            String split,
            String yourShare,
            String total
    ) {
    }

    public record NotificationSection(List<NotificationItem> items) {
    }

    public record NotificationItem(String id, String title, String time, String priority) {
    }

    public record SettlementSection(List<SettlementItem> items) {
    }

    public record SettlementItem(String id, String from, String to, long amount, String status) {
    }

    public record OneOnOneSection(List<OneOnOneItem> items) {
    }

    public record OneOnOneItem(String id, String title, long amount, long yourShare, String date) {
    }

    public record AnalyticsSection(List<AnalyticsCard> cards) {
    }

    public record AnalyticsCard(String label, String value) {
    }

    public record ExportSection(List<ExportItem> items) {
    }

    public record ExportItem(String id, String type, String scope, String generatedAt) {
    }

    public record ExpenseDetailSection(ExpenseDetail expense) {
    }

    public record ExpenseDetail(
            String id,
            String title,
            String summary,
            List<ExpenseComment> comments
    ) {
    }

    public record ExpenseComment(String id, String message) {
    }
}
