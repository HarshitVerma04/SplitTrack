package com.splititup.backend.app.repository;

import com.splititup.backend.app.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GroupMemberRepository extends JpaRepository<GroupMember, UUID> {
    List<GroupMember> findByGroupId(UUID groupId);

    boolean existsByGroupIdAndUserId(UUID groupId, UUID userId);

    long deleteByGroupIdAndUserId(UUID groupId, UUID userId);
}
