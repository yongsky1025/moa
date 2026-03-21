package com.soldesk.moa.circle.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.soldesk.moa.board.service.CirclePermissionService;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.entity.constant.CircleRole;
import com.soldesk.moa.circle.repository.CircleMemberRepository;

@ExtendWith(MockitoExtension.class)
class CirclePermissionServiceTest {

    @Mock
    private CircleMemberRepository circleMemberRepository;

    @InjectMocks
    private CirclePermissionService circlePermissionService;

    @Test
    void requireActiveMember_throwsWhenNotActive() {
        when(circleMemberRepository.existsByCircle_CircleIdAndUser_UserIdAndStatus(1L, 2L, CircleMemberStatus.ACTIVE))
                .thenReturn(false);

        assertThrows(AccessDeniedException.class, () -> circlePermissionService.requireActiveMember(1L, 2L));
    }

    @Test
    void requireLeader_throwsWhenNotLeader() {
        when(circleMemberRepository.existsByCircle_CircleIdAndUser_UserIdAndStatusAndRole(
                1L, 2L, CircleMemberStatus.ACTIVE, CircleRole.LEADER))
                .thenReturn(false);

        assertThrows(AccessDeniedException.class, () -> circlePermissionService.requireLeader(1L, 2L));
    }

    @Test
    void canEditOwnContent_checksOwner() {
        assertTrue(circlePermissionService.canEditOwnContent(10L, 10L));
        assertFalse(circlePermissionService.canEditOwnContent(10L, 11L));
    }
}
