package com.soldesk.moa.schedule.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.entity.CircleMember;
import com.soldesk.moa.circle.entity.constant.CircleMemberStatus;
import com.soldesk.moa.circle.entity.constant.CircleRole;
import com.soldesk.moa.circle.repository.CircleMemberRepository;
import com.soldesk.moa.circle.repository.CircleRepository;
import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.common.entity.constant.ImageDomain;
import com.soldesk.moa.common.entity.constant.ImageStatus;
import com.soldesk.moa.common.repository.ImageRepository;
import com.soldesk.moa.schedule.dto.ScheduleReviewCreateRequestDTO;
import com.soldesk.moa.schedule.dto.ScheduleReviewResponseDTO;
import com.soldesk.moa.schedule.entity.Schedule;
import com.soldesk.moa.schedule.entity.ScheduleReview;
import com.soldesk.moa.schedule.entity.constant.ScheduleMemberStatus;
import com.soldesk.moa.schedule.entity.constant.ScheduleStatus;
import com.soldesk.moa.schedule.repository.ScheduleMemberRepository;
import com.soldesk.moa.schedule.repository.ScheduleRepository;
import com.soldesk.moa.schedule.repository.ScheduleReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ScheduleReviewService {

    private static final ImageDomain REVIEW_IMAGE_DOMAIN = ImageDomain.SCHEDULE_REVIEW;
    private static final Pattern IMG_SRC_PATTERN = Pattern.compile(
            "<img[^>]*\\bsrc\\s*=\\s*['\"]([^'\"]+)['\"][^>]*>", Pattern.CASE_INSENSITIVE);

    private final ScheduleReviewRepository scheduleReviewRepository;
    private final ScheduleRepository scheduleRepository;
    private final ScheduleMemberRepository scheduleMemberRepository;
    private final CircleRepository circleRepository;
    private final CircleMemberRepository circleMemberRepository;
    private final ImageRepository imageRepository;

    // 후기 작성
    public ScheduleReviewResponseDTO createReview(
            Long circleId,
            Long scheduleId,
            ScheduleReviewCreateRequestDTO request,
            Long userId) {

        Circle circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

        CircleMember circleMember = circleMemberRepository
                .findByCircleAndUser_UserIdAndStatus(circle, userId, CircleMemberStatus.ACTIVE)
                .orElseThrow(() -> new AccessDeniedException("서클 활동 멤버만 후기를 작성할 수 있습니다."));

        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("일정이 존재하지 않습니다."));

        if (!schedule.getCircle().getCircleId().equals(circleId)) {
            throw new IllegalArgumentException("해당 서클의 일정이 아닙니다.");
        }

        if (schedule.getStatus() != ScheduleStatus.COMPLETED) {
            throw new IllegalStateException("완료된 일정에만 후기를 작성할 수 있습니다.");
        }

        scheduleMemberRepository.findByScheduleAndCircleMember(schedule, circleMember)
                .filter(sm -> sm.getStatus() == ScheduleMemberStatus.JOIN)
                .orElseThrow(() -> new AccessDeniedException("일정에 참여한 멤버만 후기를 작성할 수 있습니다."));

        if (scheduleReviewRepository.existsByScheduleAndCircleMember(schedule, circleMember)) {
            throw new IllegalStateException("이미 이 일정에 후기를 작성했습니다.");
        }

        ScheduleReview review = ScheduleReview.builder()
                .schedule(schedule)
                .circleMember(circleMember)
                .content(request.getContent())
                .rating(request.getRating())
                .build();

        ScheduleReview saved = scheduleReviewRepository.save(review);
        syncReviewImages(saved, userId);

        return ScheduleReviewResponseDTO.from(saved);
    }

    // 후기 목록 조회 (서클 멤버만)
    @Transactional(readOnly = true)
    public List<ScheduleReviewResponseDTO> getReviews(
            Long circleId,
            Long scheduleId,
            Long userId) {

        Circle circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

        circleMemberRepository
                .findByCircleAndUser_UserIdAndStatus(circle, userId, CircleMemberStatus.ACTIVE)
                .orElseThrow(() -> new AccessDeniedException("서클 멤버만 후기를 조회할 수 있습니다."));

        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new IllegalArgumentException("일정이 존재하지 않습니다."));

        if (!schedule.getCircle().getCircleId().equals(circleId)) {
            throw new IllegalArgumentException("해당 서클의 일정이 아닙니다.");
        }

        return scheduleReviewRepository.findByScheduleOrderByCreatedAtDesc(schedule)
                .stream()
                .map(ScheduleReviewResponseDTO::from)
                .toList();
    }

    // 후기 삭제 (작성자 본인 또는 서클 리더/부리더)
    public void deleteReview(
            Long circleId,
            Long scheduleId,
            Long reviewId,
            Long userId) {

        Circle circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

        CircleMember circleMember = circleMemberRepository
                .findByCircleAndUser_UserIdAndStatus(circle, userId, CircleMemberStatus.ACTIVE)
                .orElseThrow(() -> new AccessDeniedException("서클 활동 멤버만 후기를 삭제할 수 있습니다."));

        ScheduleReview review = scheduleReviewRepository.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("후기가 존재하지 않습니다."));

        if (!review.getSchedule().getScheduleId().equals(scheduleId)) {
            throw new IllegalArgumentException("해당 일정의 후기가 아닙니다.");
        }

        boolean isAuthor = review.getCircleMember().getId().equals(circleMember.getId());
        boolean isLeaderOrSubLeader = circleMember.getRole() == CircleRole.LEADER
                || circleMember.getRole() == CircleRole.SUB_LEADER;

        if (!isAuthor && !isLeaderOrSubLeader) {
            throw new AccessDeniedException("후기는 작성자 본인 또는 리더/부리더만 삭제할 수 있습니다.");
        }

        imageRepository.softDeleteByOwner(REVIEW_IMAGE_DOMAIN, review.getReviewId());
        scheduleReviewRepository.delete(review);
    }

    // 서클 후기 조회 (서클 멤버만, 페이지네이션 지원)
    @Transactional(readOnly = true)
    public List<ScheduleReviewResponseDTO> getCircleReviews(Long circleId, Long userId, int page, int size) {
        Circle circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new IllegalArgumentException("서클이 존재하지 않습니다."));

        circleMemberRepository
                .findByCircleAndUser_UserIdAndStatus(circle, userId, CircleMemberStatus.ACTIVE)
                .orElseThrow(() -> new AccessDeniedException("서클 멤버만 후기를 조회할 수 있습니다."));

        return scheduleReviewRepository
                .findRecentByCircleId(circleId, PageRequest.of(page, size))
                .stream()
                .map(ScheduleReviewResponseDTO::from)
                .toList();
    }

    // 후기 이미지 동기화 (TEMP → USED)
    private void syncReviewImages(ScheduleReview review, Long userId) {
        List<String> imagePaths = extractImagePaths(review.getContent());
        if (imagePaths.isEmpty()) {
            return;
        }

        Set<String> tempMatchedPaths = new HashSet<>(imageRepository.findPathsByUserAndStatusAndPathIn(
                userId, ImageStatus.TEMP, imagePaths));

        if (!tempMatchedPaths.isEmpty()) {
            imageRepository.updateStatusAndOwnerByUserAndPaths(
                    userId,
                    new ArrayList<>(tempMatchedPaths),
                    ImageStatus.TEMP,
                    ImageStatus.USED,
                    REVIEW_IMAGE_DOMAIN,
                    review.getReviewId());
        }

        // TEMP 상태가 아닌 경로는 새 Image 레코드로 생성
        List<Image> newImages = new ArrayList<>();
        for (int i = 0; i < imagePaths.size(); i++) {
            String path = imagePaths.get(i);
            if (tempMatchedPaths.contains(path)) {
                continue;
            }
            newImages.add(Image.builder()
                    .name(extractFileName(path))
                    .uuid(UUID.randomUUID().toString())
                    .path(path)
                    .domain(REVIEW_IMAGE_DOMAIN)
                    .ownerId(review.getReviewId())
                    .uploadedByUserId(userId)
                    .ord((long) (i + 1))
                    .status(ImageStatus.USED)
                    .build());
        }

        if (!newImages.isEmpty()) {
            imageRepository.saveAll(newImages);
        }
    }

    private List<String> extractImagePaths(String content) {
        if (content == null || content.isBlank()) {
            return List.of();
        }

        Matcher matcher = IMG_SRC_PATTERN.matcher(content);
        LinkedHashSet<String> orderedUniquePaths = new LinkedHashSet<>();
        while (matcher.find()) {
            String src = matcher.group(1);
            String normalized = normalizeToReviewUploadPath(src);
            if (normalized != null) {
                orderedUniquePaths.add(normalized);
            }
        }

        return new ArrayList<>(orderedUniquePaths);
    }

    private String normalizeToReviewUploadPath(String src) {
        if (src == null || src.isBlank()) {
            return null;
        }

        String trimmed = src.trim();
        if (trimmed.startsWith("/uploads/schedule_review/")) {
            return trimmed;
        }
        if (trimmed.startsWith("/uploads/images/schedule_review/")) {
            return trimmed;
        }

        int idx = trimmed.indexOf("/uploads/schedule_review/");
        if (idx >= 0) {
            return trimmed.substring(idx);
        }

        idx = trimmed.indexOf("/uploads/images/schedule_review/");
        if (idx >= 0) {
            return trimmed.substring(idx);
        }

        return null;
    }

    private String extractFileName(String path) {
        if (path == null || path.isBlank()) {
            return "uploaded-file";
        }
        int lastSlash = path.lastIndexOf('/');
        return lastSlash >= 0 ? path.substring(lastSlash + 1) : path;
    }
}
