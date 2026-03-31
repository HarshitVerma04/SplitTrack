package com.splittrack.backend.app.service;

import com.splittrack.backend.app.entity.Expense;
import com.splittrack.backend.app.repository.ExpenseRepository;
import com.splittrack.backend.auth.entity.User;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ExportService {

    private final ExpenseRepository expenseRepository;

    public ExportService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public byte[] buildCsv(User currentUser) {
        UUID userId = currentUser.getId();
        List<Expense> expenses = expenseRepository.findDistinctByGroupMembersUserIdOrderByCreatedAtDesc(userId);

        StringBuilder csv = new StringBuilder();
        csv.append("expense_id,title,group,category,total_amount,payer,created_at\n");
        for (Expense expense : expenses) {
            csv.append(csvValue(expense.getId().toString())).append(',')
                    .append(csvValue(expense.getTitle())).append(',')
                    .append(csvValue(expense.getGroup().getName())).append(',')
                    .append(csvValue(expense.getCategory())).append(',')
                    .append(csvValue(expense.getTotalAmount().toPlainString())).append(',')
                    .append(csvValue(expense.getPayer().getName())).append(',')
                    .append(csvValue(expense.getCreatedAt().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)))
                    .append('\n');
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] buildPdf(User currentUser) {
        UUID userId = currentUser.getId();
        List<Expense> expenses = expenseRepository.findDistinctByGroupMembersUserIdOrderByCreatedAtDesc(userId);

        List<String> lines = new ArrayList<>();
        lines.add("SplitTrack Personal Summary");
        lines.add("Generated: " + OffsetDateTime.now().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME));
        lines.add("User: " + safeText(currentUser.getName()) + " <" + safeText(currentUser.getEmail()) + ">");
        lines.add("Recent expenses: " + expenses.size());
        lines.add("");

        int limit = Math.min(expenses.size(), 20);
        for (int i = 0; i < limit; i++) {
            Expense expense = expenses.get(i);
            lines.add((i + 1) + ". " + safeText(expense.getTitle())
                    + " | group=" + safeText(expense.getGroup().getName())
                    + " | total=" + expense.getTotalAmount().toPlainString());
        }

        return minimalPdf(lines);
    }

    private String csvValue(String value) {
        String safe = value == null ? "" : value.replace("\"", "\"\"");
        return "\"" + safe + "\"";
    }

    private String safeText(String value) {
        if (value == null) {
            return "";
        }
        StringBuilder out = new StringBuilder();
        for (char ch : value.toCharArray()) {
            if (ch >= 32 && ch <= 126) {
                out.append(ch);
            } else {
                out.append('?');
            }
        }
        return out.toString();
    }

    private byte[] minimalPdf(List<String> lines) {
        StringBuilder stream = new StringBuilder();
        stream.append("BT\n/F1 11 Tf\n50 790 Td\n");
        for (String line : lines) {
            stream.append('(').append(pdfEscape(line)).append(") Tj\n");
            stream.append("0 -15 Td\n");
        }
        stream.append("ET\n");

        String streamData = stream.toString();
        List<String> objects = List.of(
                "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
                "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
                "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
                "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
                "5 0 obj\n<< /Length " + streamData.getBytes(StandardCharsets.US_ASCII).length + " >>\nstream\n" + streamData + "endstream\nendobj\n"
        );

        StringBuilder pdf = new StringBuilder();
        pdf.append("%PDF-1.4\n");

        List<Integer> offsets = new ArrayList<>();
        offsets.add(0);
        for (String obj : objects) {
            offsets.add(pdf.toString().getBytes(StandardCharsets.US_ASCII).length);
            pdf.append(obj);
        }

        int xrefOffset = pdf.toString().getBytes(StandardCharsets.US_ASCII).length;
        pdf.append("xref\n0 ").append(objects.size() + 1).append("\n");
        pdf.append("0000000000 65535 f \n");
        for (int i = 1; i < offsets.size(); i++) {
            pdf.append(String.format("%010d 00000 n \n", offsets.get(i)));
        }
        pdf.append("trailer\n<< /Size ").append(objects.size() + 1).append(" /Root 1 0 R >>\n");
        pdf.append("startxref\n").append(xrefOffset).append("\n%%EOF");

        return pdf.toString().getBytes(StandardCharsets.US_ASCII);
    }

    private String pdfEscape(String value) {
        String text = value == null ? "" : value;
        return text
                .replace("\\", "\\\\")
                .replace("(", "\\(")
                .replace(")", "\\)");
    }
}
