package com.splititup.backend.app.repository;

import com.splititup.backend.app.entity.SettlementRequest;
import com.splititup.backend.app.entity.SettlementStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SettlementRequestRepository extends JpaRepository<SettlementRequest, UUID> {

    @EntityGraph(attributePaths = {"fromUser", "toUser"})
    List<SettlementRequest> findTop10ByFromUserIdOrToUserIdOrderByCreatedAtDesc(UUID fromUserId, UUID toUserId);

    @EntityGraph(attributePaths = {"fromUser", "toUser"})
    List<SettlementRequest> findTop10ByToUserIdAndStatusOrderByCreatedAtDesc(UUID toUserId, SettlementStatus status);

    @EntityGraph(attributePaths = {"fromUser", "toUser"})
    Optional<SettlementRequest> findByIdAndFromUserIdOrIdAndToUserId(UUID idForFrom, UUID fromUserId, UUID idForTo, UUID toUserId);

    @EntityGraph(attributePaths = {"fromUser", "toUser"})
    List<SettlementRequest> findByStatusAndFromUserIdOrStatusAndToUserId(
            SettlementStatus statusForFrom,
            UUID fromUserId,
            SettlementStatus statusForTo,
            UUID toUserId
    );
}
