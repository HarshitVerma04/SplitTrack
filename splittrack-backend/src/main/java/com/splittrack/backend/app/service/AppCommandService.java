package com.splittrack.backend.app.service;

import com.splittrack.backend.app.dto.*;
import com.splittrack.backend.app.entity.*;
import com.splittrack.backend.app.repository.ExpenseRepository;
import com.splittrack.backend.app.repository.GroupMemberRepository;
import com.splittrack.backend.app.repository.GroupRepository;
import com.splittrack.backend.app.repository.SettlementRequestRepository;
import com.splittrack.backend.auth.entity.User;
import com.splittrack.backend.auth.repository.UserRepository;
import com.splittrack.backend.common.exception.AppException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class AppCommandService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final ExpenseRepository expenseRepository;
    private final SettlementRequestRepository settlementRequestRepository;
    private final UserRepository userRepository;

    public AppCommandService(
            GroupRepository groupRepository,
            GroupMemberRepository groupMemberRepository,
            ExpenseRepository expenseRepository,
            SettlementRequestRepository settlementRequestRepository,
            UserRepository userRepository
    ) {
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.expenseRepository = expenseRepository;
        this.settlementRequestRepository = settlementRequestRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public GroupSummaryResponse createGroup(User currentUser, CreateGroupRequest request) {
        GroupEntity group = GroupEntity.builder()
                .name(request.name().trim())
                .description(request.description() == null ? null : request.description().trim())
                .owner(currentUser)
                .build();

        GroupEntity saved = groupRepository.save(group);

        Set<UUID> memberIds = new LinkedHashSet<>();
        memberIds.add(currentUser.getId());
        if (request.memberIds() != null) {
            memberIds.addAll(request.memberIds());
        }

        List<User> members = userRepository.findAllById(memberIds);
        if (members.size() != memberIds.size()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Some member IDs are invalid");
        }

        List<GroupMember> groupMembers = members.stream()
                .map(user -> GroupMember.builder().group(saved).user(user).build())
                .toList();
        groupMemberRepository.saveAll(groupMembers);

        return new GroupSummaryResponse(
                saved.getId(),
                saved.getName(),
                saved.getDescription(),
                groupMembers.size(),
                saved.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<GroupSummaryResponse> listGroups(User currentUser) {
        return groupRepository.findDistinctByMembersUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(group -> new GroupSummaryResponse(
                        group.getId(),
                        group.getName(),
                        group.getDescription(),
                        group.getMembers().size(),
                        group.getCreatedAt()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<com.splittrack.backend.user.dto.UserDirectoryItem> listGroupMembers(User currentUser, UUID groupId) {
        if (!groupMemberRepository.existsByGroupIdAndUserId(groupId, currentUser.getId())) {
            throw new AppException(HttpStatus.FORBIDDEN, "You are not a member of this group");
        }
        return groupMemberRepository.findByGroupId(groupId).stream()
                .map(gm -> new com.splittrack.backend.user.dto.UserDirectoryItem(
                        gm.getUser().getId(),
                        gm.getUser().getName(),
                        gm.getUser().getEmail()
                ))
                .toList();
    }

    @Transactional
    public GroupSummaryResponse addMembers(User currentUser, UUID groupId, List<UUID> memberIds) {
        GroupEntity group = groupRepository.findByIdAndOwnerId(groupId, currentUser.getId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Group not found or you are not the owner"));

        Set<UUID> requestedIds = new LinkedHashSet<>(memberIds);
        if (requestedIds.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "At least one member ID is required");
        }

        Set<UUID> existingMemberIds = group.getMembers().stream()
                .map(groupMember -> groupMember.getUser().getId())
                .collect(java.util.stream.Collectors.toSet());

        requestedIds.removeAll(existingMemberIds);
        if (requestedIds.isEmpty()) {
            return new GroupSummaryResponse(
                    group.getId(),
                    group.getName(),
                    group.getDescription(),
                    group.getMembers().size(),
                    group.getCreatedAt()
            );
        }

        List<User> users = userRepository.findAllById(requestedIds);
        if (users.size() != requestedIds.size()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Some member IDs are invalid");
        }

        List<GroupMember> newMembers = users.stream()
                .map(user -> GroupMember.builder().group(group).user(user).build())
                .toList();
        groupMemberRepository.saveAll(newMembers);
        group.getMembers().addAll(newMembers);

        return new GroupSummaryResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getMembers().size(),
                group.getCreatedAt()
        );
    }

        @Transactional
        public GroupSummaryResponse removeMember(User currentUser, UUID groupId, UUID memberId) {
                GroupEntity group = groupRepository.findByIdAndOwnerId(groupId, currentUser.getId())
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Group not found or you are not the owner"));

                if (group.getOwner().getId().equals(memberId)) {
                        throw new AppException(HttpStatus.BAD_REQUEST, "Group owner cannot be removed");
                }

                long removed = groupMemberRepository.deleteByGroupIdAndUserId(groupId, memberId);
                if (removed == 0) {
                        throw new AppException(HttpStatus.NOT_FOUND, "Member not found in group");
                }

                int membersCount = groupMemberRepository.findByGroupId(groupId).size();
                return new GroupSummaryResponse(
                                group.getId(),
                                group.getName(),
                                group.getDescription(),
                                membersCount,
                                group.getCreatedAt()
                );
        }

    @Transactional
    public ExpenseSummaryResponse createExpense(User currentUser, CreateExpenseRequest request) {
        GroupEntity group = groupRepository.findByIdAndMembersUserId(request.groupId(), currentUser.getId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Group not found or inaccessible"));

        UUID payerId = request.payerId() == null ? currentUser.getId() : request.payerId();
        if (!groupMemberRepository.existsByGroupIdAndUserId(group.getId(), payerId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Payer must be a group member");
        }

        User payer = userRepository.findById(payerId)
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Payer not found"));

        if (request.splits() == null || request.splits().isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "At least one split is required");
        }

        BigDecimal splitTotal = request.splits().stream()
                .map(CreateExpenseRequest.ExpenseSplitInput::amount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal expenseTotal = request.totalAmount().setScale(2, RoundingMode.HALF_UP);
        if (splitTotal.compareTo(expenseTotal) != 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Sum of splits must equal total amount");
        }

        Set<UUID> splitUserIds = request.splits().stream().map(CreateExpenseRequest.ExpenseSplitInput::userId).collect(java.util.stream.Collectors.toSet());
        for (UUID splitUserId : splitUserIds) {
            if (!groupMemberRepository.existsByGroupIdAndUserId(group.getId(), splitUserId)) {
                throw new AppException(HttpStatus.BAD_REQUEST, "All split users must be members of the group");
            }
        }

        Map<UUID, User> usersById = userRepository.findAllById(splitUserIds).stream()
                .collect(java.util.stream.Collectors.toMap(User::getId, u -> u));
        if (usersById.size() != splitUserIds.size()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Some split users do not exist");
        }

        Expense expense = Expense.builder()
                .group(group)
                .title(request.title().trim())
                .category(request.category().trim())
                .splitType(SplitType.EXACT)
                .totalAmount(expenseTotal)
                .payer(payer)
                .build();

        List<ExpenseSplit> splits = request.splits().stream()
                .map(input -> ExpenseSplit.builder()
                        .expense(expense)
                        .user(usersById.get(input.userId()))
                        .amount(input.amount().setScale(2, RoundingMode.HALF_UP))
                        .build())
                .toList();

        expense.getSplits().addAll(splits);

        Expense saved = expenseRepository.save(expense);

        return new ExpenseSummaryResponse(
                saved.getId(),
                group.getId(),
                saved.getTitle(),
                saved.getCategory(),
                saved.getTotalAmount(),
                saved.getPayer().getId(),
                saved.getCreatedAt()
        );
    }

        @Transactional
        public ExpenseSummaryResponse updateExpense(User currentUser, UUID expenseId, UpdateExpenseRequest request) {
                Expense expense = expenseRepository.findByIdAndGroupMembersUserId(expenseId, currentUser.getId())
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Expense not found or inaccessible"));

                GroupEntity group = expense.getGroup();

                if (request.title() != null) {
                        String trimmed = request.title().trim();
                        if (trimmed.isEmpty()) {
                                throw new AppException(HttpStatus.BAD_REQUEST, "Expense title cannot be empty");
                        }
                        expense.setTitle(trimmed);
                }

                if (request.category() != null) {
                        String trimmed = request.category().trim();
                        if (trimmed.isEmpty()) {
                                throw new AppException(HttpStatus.BAD_REQUEST, "Expense category cannot be empty");
                        }
                        expense.setCategory(trimmed);
                }

                UUID payerId = request.payerId() == null ? expense.getPayer().getId() : request.payerId();
                if (!groupMemberRepository.existsByGroupIdAndUserId(group.getId(), payerId)) {
                        throw new AppException(HttpStatus.BAD_REQUEST, "Payer must be a group member");
                }
                User payer = userRepository.findById(payerId)
                                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Payer not found"));
                expense.setPayer(payer);

                BigDecimal targetTotal = request.totalAmount() == null
                                ? expense.getTotalAmount()
                                : request.totalAmount().setScale(2, RoundingMode.HALF_UP);

                if (request.splits() == null && request.totalAmount() != null) {
                        BigDecimal existingSplitTotal = expense.getSplits().stream()
                                        .map(ExpenseSplit::getAmount)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                                        .setScale(2, RoundingMode.HALF_UP);
                        if (existingSplitTotal.compareTo(targetTotal) != 0) {
                                throw new AppException(HttpStatus.BAD_REQUEST, "Provide updated splits when changing total amount");
                        }
                }

                if (request.splits() != null) {
                        if (request.splits().isEmpty()) {
                                throw new AppException(HttpStatus.BAD_REQUEST, "At least one split is required");
                        }

                        Set<UUID> splitUserIds = request.splits().stream()
                                        .map(CreateExpenseRequest.ExpenseSplitInput::userId)
                                        .collect(java.util.stream.Collectors.toSet());

                        for (UUID splitUserId : splitUserIds) {
                                if (!groupMemberRepository.existsByGroupIdAndUserId(group.getId(), splitUserId)) {
                                        throw new AppException(HttpStatus.BAD_REQUEST, "All split users must be members of the group");
                                }
                        }

                        Map<UUID, User> usersById = userRepository.findAllById(splitUserIds).stream()
                                        .collect(java.util.stream.Collectors.toMap(User::getId, u -> u));
                        if (usersById.size() != splitUserIds.size()) {
                                throw new AppException(HttpStatus.BAD_REQUEST, "Some split users do not exist");
                        }

                        BigDecimal splitTotal = request.splits().stream()
                                        .map(CreateExpenseRequest.ExpenseSplitInput::amount)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                                        .setScale(2, RoundingMode.HALF_UP);
                        if (splitTotal.compareTo(targetTotal) != 0) {
                                throw new AppException(HttpStatus.BAD_REQUEST, "Sum of splits must equal total amount");
                        }

                        expense.getSplits().clear();
                        List<ExpenseSplit> splits = request.splits().stream()
                                        .map(input -> ExpenseSplit.builder()
                                                        .expense(expense)
                                                        .user(usersById.get(input.userId()))
                                                        .amount(input.amount().setScale(2, RoundingMode.HALF_UP))
                                                        .build())
                                        .toList();
                        expense.getSplits().addAll(splits);
                }

                expense.setTotalAmount(targetTotal);

                Expense saved = expenseRepository.save(expense);

                return new ExpenseSummaryResponse(
                                saved.getId(),
                                group.getId(),
                                saved.getTitle(),
                                saved.getCategory(),
                                saved.getTotalAmount(),
                                saved.getPayer().getId(),
                                saved.getCreatedAt()
                );
        }

    @Transactional
    public SettlementSummaryResponse createSettlement(User currentUser, CreateSettlementRequest request) {
        if (currentUser.getId().equals(request.toUserId())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Cannot create settlement with yourself");
        }

        User toUser = userRepository.findById(request.toUserId())
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Recipient user not found"));

        SettlementRequest settlement = SettlementRequest.builder()
                .fromUser(currentUser)
                .toUser(toUser)
                .amount(request.amount().setScale(2, RoundingMode.HALF_UP))
                .status(SettlementStatus.PENDING)
                .build();

        SettlementRequest saved = settlementRequestRepository.save(settlement);

        return new SettlementSummaryResponse(
                saved.getId(),
                saved.getFromUser().getId(),
                saved.getToUser().getId(),
                saved.getAmount(),
                saved.getStatus().name(),
                saved.getCreatedAt()
        );
    }

        @Transactional
        public void deleteGroup(User currentUser, UUID groupId) {
                GroupEntity group = groupRepository.findByIdAndOwnerId(groupId, currentUser.getId())
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Group not found or you are not the owner"));
                groupRepository.delete(group);
        }

        @Transactional
        public void deleteExpense(User currentUser, UUID expenseId) {
                Expense expense = expenseRepository.findByIdAndGroupMembersUserId(expenseId, currentUser.getId())
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Expense not found or inaccessible"));
                expenseRepository.delete(expense);
        }

        @Transactional
        public SettlementSummaryResponse updateSettlementStatus(User currentUser, UUID settlementId, String status) {
                SettlementRequest settlement = settlementRequestRepository
                                .findByIdAndFromUserIdOrIdAndToUserId(settlementId, currentUser.getId(), settlementId, currentUser.getId())
                                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Settlement not found or inaccessible"));

                SettlementStatus nextStatus;
                try {
                        nextStatus = SettlementStatus.valueOf(status.trim().toUpperCase());
                } catch (IllegalArgumentException ex) {
                        throw new AppException(HttpStatus.BAD_REQUEST, "Invalid settlement status");
                }

                settlement.setStatus(nextStatus);

                return new SettlementSummaryResponse(
                                settlement.getId(),
                                settlement.getFromUser().getId(),
                                settlement.getToUser().getId(),
                                settlement.getAmount(),
                                settlement.getStatus().name(),
                                settlement.getCreatedAt()
                );
        }
}
