package com.soldesk.moa.circle.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.circle.dto.CircleCreateRequestDTO;
import com.soldesk.moa.circle.dto.CircleResponseDTO;
import com.soldesk.moa.circle.dto.CircleUpdateRequestDTO;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.CircleCategory;
import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.entity.constant.CircleRole;
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.circle.repository.CircleCategoryRepository;
import com.soldesk.moa.circle.repository.CircleMemberRepository;
import com.soldesk.moa.circle.repository.CircleRepository;
import com.soldesk.moa.common.dto.PageRequestDTO;
import com.soldesk.moa.common.dto.PageResultDTO;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CircleService {

        private final CircleRepository circleRepository;
        private final CircleCategoryRepository categoryRepository;
        private final CircleMemberRepository circleMemberRepository;
        private final UsersRepository usersRepository;

        // 서클 생성
        @Transactional
        public CircleResponseDTO createCircle(CircleCreateRequestDTO request, Long userId) {

                Users loginUser = usersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

                CircleCategory circleCategory = categoryRepository.findById(request.getCategoryId())
                                .orElseThrow(() -> new IllegalArgumentException("카테고리가 존재하지 않습니다."));

                Circle circle = Circle.builder()
                                .name(request.getName())
                                .description(request.getDescription())
                                .maxMember(request.getMaxMember())
                                .currentMember(1) // 최초 멤버 = 생성자
                                .status(CircleStatus.OPEN) // 기본 OPEN
                                .category(circleCategory)
                                .build();

                Circle savedCircle = circleRepository.save(circle);

                // CircleMember 생성 (리더)
                CircleMember leader = CircleMember.builder()
                                .circle(savedCircle)
                                .user(loginUser)
                                .role(CircleRole.LEADER)
                                .status(CircleMemberStatus.ACTIVE)
                                .build();

                circleMemberRepository.save(leader);

                return new CircleResponseDTO(savedCircle);
        }

        // 서클 삭제
        // 삭제 시 서클 멤버들에게 알림 처리 or 동의를 구하는 방식 추가
        @Transactional
        public void deleteCircle(Long circleId) {
                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                circleMemberRepository.deleteByCircle(circle);
                circleRepository.delete(circle);
        }

        // 서클 정보 수정
        @Transactional
        public CircleResponseDTO updateCircle(Long circleId, CircleUpdateRequestDTO request) {

                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                Circle updatedCircle = Circle.builder()
                                .circleId(circle.getCircleId())
                                .name(request.getName())
                                .description(request.getDescription())
                                .maxMember(circle.getMaxMember())
                                .currentMember(circle.getCurrentMember())
                                .status(circle.getStatus())
                                .category(circle.getCategory())
                                .build();

                return new CircleResponseDTO(circleRepository.save(updatedCircle));
        }

        // 서클 상세 정보
        @Transactional(readOnly = true)
        public CircleResponseDTO getCircle(Long circleId) {
                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                return CircleResponseDTO.from(circle);
        }

        // 서클 리스트 조회
        @Transactional(readOnly = true)
        public PageResultDTO<CircleResponseDTO> getCircles(
                        Long categoryId,
                        PageRequestDTO pageRequestDTO) {

                PageResultDTO<Circle> result = circleRepository.findByCategory_CategoryId(
                                categoryId,
                                pageRequestDTO);

                // 엔티티 → DTO 변환
                return PageResultDTO.<CircleResponseDTO>withAll()
                                .dtoList(
                                                result.getDtoList()
                                                                .stream()
                                                                .map(CircleResponseDTO::new)
                                                                .toList())
                                .pageRequestDTO(pageRequestDTO)
                                .totalCount(result.getTotalCount())
                                .build();
        }

}