package com.soldesk.moa.circle.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.soldesk.moa.circle.dto.CircleMemberResponseDTO;
import com.soldesk.moa.circle.dto.CircleMemberStatusRequestDTO;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.service.CircleMemberService;
import com.soldesk.moa.common.dto.PageRequestDTO;
import com.soldesk.moa.common.dto.PageResultDTO;
import com.soldesk.moa.users.dto.AuthUserDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/circles/{circleId}/members")
@RequiredArgsConstructor
@Validated
public class CircleMemberContoller {

        private final CircleMemberService circleMemberService;

        // 가입 신청
        @PostMapping
        public ResponseEntity<Void> joinCircle(
                        @PathVariable Long circleId,
                        @AuthenticationPrincipal AuthUserDTO authUserDTO) {

                circleMemberService.requestJoin(circleId, authUserDTO.getUserId());

                return ResponseEntity.status(HttpStatus.CREATED).build();
        }

        // 서클 상세용 ACTIVE 멤버 조회 (공개)
        @GetMapping("/active")
        public ResponseEntity<PageResultDTO<CircleMemberResponseDTO>> getActiveMembers(
                        @PathVariable Long circleId,
                        @ModelAttribute PageRequestDTO pageRequestDTO) {

                return ResponseEntity.ok(
                                circleMemberService.getActiveMembers(circleId, pageRequestDTO));
        }

        // 리더 전용 서클 멤버 조회(상태값 null=전체조회)
        @GetMapping
        public ResponseEntity<PageResultDTO<CircleMemberResponseDTO>> getMembers(
                        @PathVariable Long circleId,
                        @RequestParam(required = false) CircleMemberStatus status,
                        @ModelAttribute PageRequestDTO pageRequestDTO,
                        @AuthenticationPrincipal AuthUserDTO authUserDTO) {
                return ResponseEntity.ok(
                                circleMemberService.getMembers(
                                                circleId,
                                                status,
                                                pageRequestDTO,
                                                authUserDTO.getUserId()));
        }

        // 멤버 상태 변경 (승인 / 거절)
        // 기존 데이터는 유지. status 필드만 수정
        @PatchMapping("/{memberId}")
        public ResponseEntity<Void> updateMemberStatus(
                        @PathVariable Long circleId,
                        @PathVariable Long memberId,
                        @RequestBody CircleMemberStatusRequestDTO request,
                        @AuthenticationPrincipal AuthUserDTO authUserDTO) {

                circleMemberService.changeStatus(
                                circleId,
                                memberId,
                                request.getStatus(),
                                authUserDTO.getUserId());

                return ResponseEntity.ok().build();
        }

        // 서클 탈퇴
        @DeleteMapping
        public ResponseEntity<Void> leaveCircle(
                        @PathVariable Long circleId,
                        @AuthenticationPrincipal AuthUserDTO authUser) {

                circleMemberService.leaveCircle(circleId, authUser.getUserId());
                return ResponseEntity.noContent().build();
        }

        // 리더 권한 위임
        @PostMapping("/{memberId}/delegate")
        public ResponseEntity<Void> delegateLeader(
                        @PathVariable Long circleId,
                        @PathVariable Long memberId,
                        @AuthenticationPrincipal AuthUserDTO authUser) {

                circleMemberService.delegateLeader(
                                circleId,
                                memberId,
                                authUser.getUserId());

                return ResponseEntity.ok().build();
        }
}
