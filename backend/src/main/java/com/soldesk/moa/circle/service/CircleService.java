package com.soldesk.moa.circle.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

import com.soldesk.moa.circle.dto.CircleCategoryResponseDTO;
import com.soldesk.moa.circle.dto.CircleCreateRequestDTO;
import com.soldesk.moa.circle.dto.CircleResponseDTO;
import com.soldesk.moa.circle.dto.CircleUpdateRequestDTO;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.CircleCategory;
import com.soldesk.moa.circle.entity.CircleEnergyProfile;
import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.entity.constant.CircleRole;
import com.soldesk.moa.circle.entity.constant.CircleStatus;
import com.soldesk.moa.circle.repository.CircleCategoryRepository;
import com.soldesk.moa.circle.repository.CircleEnergyProfileRepository;
import com.soldesk.moa.circle.repository.CircleMemberRepository;
import com.soldesk.moa.circle.repository.CircleRepository;
import com.soldesk.moa.chat.service.ChatRoomService;
import com.soldesk.moa.notification.domain.NotificationType;
import com.soldesk.moa.notification.service.NotificationService;
import com.soldesk.moa.common.dto.PageRequestDTO;
import com.soldesk.moa.common.dto.PageResultDTO;
import com.soldesk.moa.common.entity.Image;
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
        private final CircleEnergyProfileRepository circleEnergyProfileRepository;
        private final UsersRepository usersRepository;
        private final CircleImageService circleImageService;
        private final ChatRoomService chatRoomService;
        private final NotificationService notificationService;

        // 서클 생성 (POST multipart - Tomcat이 POST multipart 정상 처리)
        @Transactional
        public CircleResponseDTO createCircle(CircleCreateRequestDTO request, MultipartFile imageFile, Long userId) {

                Users loginUser = usersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

                CircleCategory circleCategory = categoryRepository.findById(request.getCategoryId())
                                .orElseThrow(() -> new IllegalArgumentException("카테고리가 존재하지 않습니다."));

                Image coverImage = null;
                if (imageFile != null && !imageFile.isEmpty()) {
                        try {
                                coverImage = circleImageService.saveCoverImage(imageFile, userId);
                        } catch (IOException e) {
                                throw new IllegalStateException("이미지 업로드에 실패했습니다: " + e.getMessage());
                        }
                }

                Circle circle = Circle.builder()
                                .name(request.getName())
                                .description(request.getDescription())
                                .maxMember(request.getMaxMember())
                                .currentMember(1)
                                .status(CircleStatus.PENDING)
                                .category(circleCategory)
                                .coverImage(coverImage)
                                .build();

                Circle savedCircle = circleRepository.save(circle);

                CircleEnergyProfile energyProfile = CircleEnergyProfile.builder()
                                .circle(savedCircle)
                                .socialLoad(request.getSocialLoad())
                                .interactionMode(request.getInteractionMode())
                                .structureLevel(request.getStructureLevel())
                                .activityIntensity(request.getActivityIntensity())
                                .commitmentLevel(request.getCommitmentLevel())
                                .build();

                circleEnergyProfileRepository.save(energyProfile);

                CircleMember leader = CircleMember.builder()
                                .circle(savedCircle)
                                .user(loginUser)
                                .role(CircleRole.LEADER)
                                .status(CircleMemberStatus.ACTIVE)
                                .build();

                circleMemberRepository.save(leader);

                // 모임 생성 시 그룹 채팅방 자동 생성 + 모임장 입장
                chatRoomService.getOrCreateGroupRoom(savedCircle.getCircleId(), userId);

                return new CircleResponseDTO(savedCircle);
        }

        // 서클 삭제 (리더만 가능)
        @Transactional
        public void deleteCircle(Long circleId, Long userId) {
                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                Users loginUser = usersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

                circleMemberRepository
                                .findByCircleAndUserAndRole(circle, loginUser, CircleRole.LEADER)
                                .orElseThrow(() -> new AccessDeniedException("리더만 서클을 삭제할 수 있습니다."));

                Circle closed = Circle.builder()
                                .circleId(circle.getCircleId())
                                .name(circle.getName())
                                .description(circle.getDescription())
                                .maxMember(circle.getMaxMember())
                                .currentMember(circle.getCurrentMember())
                                .status(CircleStatus.CLOSED)
                                .category(circle.getCategory())
                                .coverImage(circle.getCoverImage())
                                .build();

                circleRepository.save(closed);
        }

        // [Admin] 서클 강제 해산
        @Transactional
        public void adminDeleteCircle(Long circleId) {
                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                // 활성 멤버들에게 해산 알림 발송 (상태 변경 전에 조회)
                circleMemberRepository.findByCircleAndStatus(circle, CircleMemberStatus.ACTIVE)
                                .forEach(m -> notificationService.send(
                                                m.getUser().getUserId(),
                                                NotificationType.CIRCLE_DISBANDED,
                                                "'" + circle.getName() + "' 모임이 해산되었습니다."));

                Circle closed = Circle.builder()
                                .circleId(circle.getCircleId())
                                .name(circle.getName())
                                .description(circle.getDescription())
                                .maxMember(circle.getMaxMember())
                                .currentMember(circle.getCurrentMember())
                                .status(CircleStatus.CLOSED)
                                .category(circle.getCategory())
                                .coverImage(circle.getCoverImage())
                                .build();

                circleRepository.save(closed);
        }

        // 서클 정보 수정 (리더만 가능, JSON)
        // 이미지 변경은 uploadCoverImage 사용
        @Transactional
        public CircleResponseDTO updateCircle(Long circleId, CircleUpdateRequestDTO request, Long userId) {

                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                Users loginUser = usersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

                circleMemberRepository
                                .findByCircleAndUserAndRole(circle, loginUser, CircleRole.LEADER)
                                .orElseThrow(() -> new AccessDeniedException("리더만 서클 정보를 수정할 수 있습니다."));

                int newMaxMember = (request.getMaxMember() != null)
                                ? request.getMaxMember()
                                : circle.getMaxMember();

                if (newMaxMember < circle.getCurrentMember()) {
                        throw new IllegalArgumentException(
                                "최대 인원은 현재 인원(" + circle.getCurrentMember() + "명) 이상이어야 합니다.");
                }

                // 이미지는 변경하지 않음 (null 전달 → update() 내부에서 기존 이미지 유지)
                circle.update(request.getName(), request.getDescription(), newMaxMember, null);

                return new CircleResponseDTO(circle);
        }

        // 서클 대표 이미지 업로드/교체 (리더만 가능, POST multipart)
        @Transactional
        public CircleResponseDTO uploadCoverImage(Long circleId, MultipartFile imageFile, Long userId) {

                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                Users loginUser = usersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

                circleMemberRepository
                                .findByCircleAndUserAndRole(circle, loginUser, CircleRole.LEADER)
                                .orElseThrow(() -> new AccessDeniedException("리더만 이미지를 변경할 수 있습니다."));

                try {
                        Image newImage = circleImageService.saveCoverImage(imageFile, userId);
                        circle.update(circle.getName(), circle.getDescription(), circle.getMaxMember(), newImage);
                } catch (IOException e) {
                        throw new IllegalStateException("이미지 업로드에 실패했습니다: " + e.getMessage());
                }

                return new CircleResponseDTO(circle);
        }

        // 서클 상세 정보
        @Transactional(readOnly = true)
        public CircleResponseDTO getCircle(Long circleId) {
                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                return CircleResponseDTO.from(circle);
        }

        // 내가 가입한 서클 목록 조회 (ACTIVE 상태)
        @Transactional(readOnly = true)
        public List<CircleResponseDTO> getMyCircles(Long userId) {
                return circleMemberRepository.findByUser_UserIdAndStatus(userId, CircleMemberStatus.ACTIVE)
                                .stream()
                                .map(cm -> new CircleResponseDTO(cm.getCircle()))
                                .toList();
        }

        // [Admin] 보류 중인 서클 목록 조회
        @Transactional(readOnly = true)
        public List<CircleResponseDTO> getPendingCircles() {
                return circleRepository.findByStatus(CircleStatus.PENDING)
                                .stream()
                                .map(CircleResponseDTO::new)
                                .toList();
        }

        // [Admin] 서클 승인
        @Transactional
        public CircleResponseDTO approveCircle(Long circleId) {
                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                if (circle.getStatus() != CircleStatus.PENDING) {
                        throw new IllegalStateException("보류 상태인 서클만 승인할 수 있습니다.");
                }

                Circle approved = Circle.builder()
                                .circleId(circle.getCircleId())
                                .name(circle.getName())
                                .description(circle.getDescription())
                                .maxMember(circle.getMaxMember())
                                .currentMember(circle.getCurrentMember())
                                .status(CircleStatus.OPEN)
                                .category(circle.getCategory())
                                .coverImage(circle.getCoverImage())
                                .build();

                return new CircleResponseDTO(circleRepository.save(approved));
        }

        // [Admin] 서클 거절
        @Transactional
        public void rejectCircle(Long circleId) {
                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

                if (circle.getStatus() != CircleStatus.PENDING) {
                        throw new IllegalStateException("보류 상태인 서클만 거절할 수 있습니다.");
                }

                Circle rejected = Circle.builder()
                                .circleId(circle.getCircleId())
                                .name(circle.getName())
                                .description(circle.getDescription())
                                .maxMember(circle.getMaxMember())
                                .currentMember(circle.getCurrentMember())
                                .status(CircleStatus.REJECTED)
                                .category(circle.getCategory())
                                .coverImage(circle.getCoverImage())
                                .build();

                circleRepository.save(rejected);
        }

        // 추천 서클 목록 조회 (유저 에너지 프로필 기반)
        @Transactional(readOnly = true)
        public List<CircleResponseDTO> getRecommendedCircles(Long userId) {
                Users loginUser = usersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

                if (loginUser.getEnergyProfile() == null) {
                        throw new IllegalStateException("에너지 프로필을 먼저 설정해주세요.");
                }

                var profile = loginUser.getEnergyProfile();

                return circleRepository.findRecommended(
                                profile.getSocialLoad(),
                                profile.getInteractionMode(),
                                profile.getStructureLevel(),
                                profile.getActivityIntensity(),
                                profile.getCommitmentLevel())
                                .stream()
                                .map(CircleResponseDTO::new)
                                .toList();
        }

        // 카테고리 전체 목록 조회
        @Transactional(readOnly = true)
        public List<CircleCategoryResponseDTO> getCategories() {
                return categoryRepository.findAll()
                                .stream()
                                .map(CircleCategoryResponseDTO::new)
                                .toList();
        }

        // 서클 리스트 조회
        @Transactional(readOnly = true)
        public PageResultDTO<CircleResponseDTO> getCircles(
                        Long categoryId,
                        PageRequestDTO pageRequestDTO) {

                PageResultDTO<Circle> result = circleRepository.findByCategory_CategoryId(
                                categoryId,
                                pageRequestDTO);

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
