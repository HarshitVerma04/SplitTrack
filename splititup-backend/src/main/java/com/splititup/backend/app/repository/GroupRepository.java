package com.splititup.backend.app.repository;

import com.splititup.backend.app.entity.GroupEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GroupRepository extends JpaRepository<GroupEntity, UUID> {

    @EntityGraph(attributePaths = {"owner", "members", "members.user"})
    List<GroupEntity> findDistinctByMembersUserIdOrderByCreatedAtDesc(UUID userId);

    @EntityGraph(attributePaths = {"owner", "members", "members.user"})
    Optional<GroupEntity> findByIdAndMembersUserId(UUID groupId, UUID userId);

    Optional<GroupEntity> findByIdAndOwnerId(UUID groupId, UUID ownerId);
}
