package com.soldesk.moa.admin.report.service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.admin.dashboard.repository.AdminUsersRepository;
import com.soldesk.moa.admin.report.dto.ReportFilterDTO;
import com.soldesk.moa.admin.report.dto.ReportRequestDTO;
import com.soldesk.moa.admin.report.dto.ReportResponseDTO;
import com.soldesk.moa.admin.report.dto.ReportTargetContentDTO;
import com.soldesk.moa.admin.report.dto.ReportTargetContentDTO.UserRecentActivityDTO;
import com.soldesk.moa.admin.report.entity.Report;
import com.soldesk.moa.admin.report.entity.constant.ReportStatus;
import com.soldesk.moa.admin.report.entity.constant.ReportTargetType;
import com.soldesk.moa.admin.report.repository.ReportImageRepository;
import com.soldesk.moa.admin.report.repository.ReportRepository;
import com.soldesk.moa.common.entity.constant.ImageDomain;
import com.soldesk.moa.common.entity.constant.ImageStatus;
import com.soldesk.moa.common.repository.ImageRepository;
import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.repository.CircleRepository;
import com.soldesk.moa.common.dto.PageResultDTO;
import com.soldesk.moa.place.entity.PlaceReview;
import com.soldesk.moa.place.repository.PlaceReviewRepository;
import com.soldesk.moa.post.entity.Post;
import com.soldesk.moa.post.repository.PostRepository;
import com.soldesk.moa.reply.entity.Reply;
import com.soldesk.moa.reply.repository.ReplyRepository;
import com.soldesk.moa.users.entity.Users;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Transactional
@Log4j2
public class ReportService {

        private final ReportRepository reportRepository;
        private final AdminUsersRepository adminUsersRepository;
        private final PostRepository postRepository;
        private final ReplyRepository replyRepository;
        private final CircleRepository circleRepository;
        private final PlaceReviewRepository placeReviewRepository;
        private final ReportImageRepository reportImageRepository;
        private final ImageRepository imageRepository;

        // 신고접수
        public void submitReport(Long reporterId, ReportRequestDTO dto) {
                Users reporter = adminUsersRepository.findById(reporterId)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

                // 중복 신고인지 체크
                boolean isDuplicate = reportRepository.existsByReporter_UserIdAndTargetTypeAndTargetId(reporterId,
                                dto.targetType(), dto.targetId());
                if (isDuplicate) {
                        throw new IllegalStateException("이미 신고한 대상입니다.");
                }

                Report report = reportRepository.save(Report.builder()
                                .reporter(reporter)
                                .targetType(dto.targetType())
                                .targetId(dto.targetId())
                                .category(dto.category())
                                .description(dto.description())
                                .build());

                // 증거 이미지 연결 (TEMP → USED, domain=REPORT, ownerId=reportId)
                if (dto.imagePaths() != null && !dto.imagePaths().isEmpty()) {
                        imageRepository.updateStatusAndOwnerByUserAndPaths(reporterId, dto.imagePaths(),
                                        ImageStatus.TEMP, ImageStatus.USED, ImageDomain.REPORT, report.getId());
                }
        }

        // 신고리스트
        @Transactional(readOnly = true)
        public PageResultDTO<ReportResponseDTO> getReports(ReportFilterDTO filterDTO) {

                Pageable pageable = PageRequest.of(filterDTO.getPage() - 1, filterDTO.getSize());
                Page<Report> reportPage = reportRepository.searchReports(filterDTO, pageable);

                // entity -> dto
                List<ReportResponseDTO> dtoList = reportPage.getContent()
                                .stream().map(this::entityToDto).collect(Collectors.toList());

                return PageResultDTO.<ReportResponseDTO>withAll()
                                .dtoList(dtoList)
                                .pageRequestDTO(filterDTO)
                                .totalCount(reportPage.getTotalElements())
                                .build();
        }

        // 신고 상세 조회
        public ReportResponseDTO getOneReport(Long reportId) {
                Report report = reportRepository.findById(reportId)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 신고입니다."));

                // 신고 조회 순간 status 검토중으로 변경
                if (report.getStatus() == ReportStatus.PENDING) {
                        report.setStatus(ReportStatus.REVIEWING);
                }

                ReportTargetContentDTO targetContent = fetchTargetContent(
                                report.getTargetType(), report.getTargetId());

                List<String> imagePaths = reportImageRepository
                                .findByDomainAndOwnerIdAndDeletedFalse(ImageDomain.REPORT, reportId)
                                .stream().map(com.soldesk.moa.common.entity.Image::getPath).toList();

                ReportResponseDTO dto = entityToDto(report);
                return new ReportResponseDTO(
                                dto.reportId(), dto.reporterName(), dto.targetType(), dto.targetId(),
                                dto.category(), dto.description(), dto.status(), dto.adminNote(),
                                dto.createdAt(), targetContent, imagePaths);
        }

        // 신고 상태 변경(status 변경, adminNote추가)
        public void updateReportStatus(Long reportId, ReportStatus status, String adminNote) {
                if (adminNote == null || adminNote.isBlank()) {
                        throw new IllegalArgumentException("관리자 메모는 필수 입력 항목입니다.");
                }
                Report report = reportRepository.findById(reportId)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 신고입니다."));
                report.setStatus(status);
                report.setAdminNote(adminNote.trim());
        }

        // entity -> dto 변환 전용메소드
        private ReportResponseDTO entityToDto(Report report) {
                return ReportResponseDTO.builder()
                                .reportId(report.getId())
                                .reporterName(report.getReporter().getName())
                                .targetType(report.getTargetType())
                                .targetId(report.getTargetId())
                                .category(report.getCategory())
                                .description(report.getDescription())
                                .status(report.getStatus())
                                .adminNote(report.getAdminNote())
                                .createdAt(report.getCreateDate())
                                .build();
        }

        // targetType별 콘텐츠 조회
        private ReportTargetContentDTO fetchTargetContent(ReportTargetType targetType, Long targetId) {
                try {
                        return switch (targetType) {
                                case POST -> fetchPostContent(targetId);
                                case REPLY -> fetchReplyContent(targetId);
                                case CIRCLE -> fetchCircleContent(targetId);
                                case USER -> fetchUserContent(targetId);
                                case PLACE_REVIEW -> fetchPlaceReviewContent(targetId);
                        };
                } catch (Exception e) {
                        log.warn("신고 대상 콘텐츠 조회 실패: type={}, id={}, error={}", targetType, targetId, e.getMessage());
                        return ReportTargetContentDTO.builder()
                                        .targetType(targetType)
                                        .targetId(targetId)
                                        .deleted(true)
                                        .build();
                }
        }

        private String buildPostLinkUrl(Post post) {
                Board board = post.getBoardId();
                return switch (board.getBoardType()) {
                        case FREE -> "/board/free/" + post.getPostId();
                        case NOTICE -> "/board/notice/" + post.getPostId();
                        case CIRCLE -> "/board/circle/" + board.getCircleId().getCircleId()
                                        + "/boards/" + board.getBoardId()
                                        + "/posts/" + post.getPostId();
                };
        }

        private ReportTargetContentDTO fetchPostContent(Long postId) {
                Post post = postRepository.findById(postId)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));
                return ReportTargetContentDTO.builder()
                                .targetType(ReportTargetType.POST)
                                .targetId(postId)
                                .deleted(post.isDeleted())
                                .linkUrl(buildPostLinkUrl(post))
                                .postTitle(post.getTitle())
                                .postContent(post.getContent().length() > 300
                                                ? post.getContent().substring(0, 300) + "..."
                                                : post.getContent())
                                .postAuthorName(post.getUserId().getName())
                                .postBoardId(post.getBoardId().getBoardId())
                                .postCreatedAt(post.getCreateDate())
                                .build();
        }

        private ReportTargetContentDTO fetchReplyContent(Long replyId) {
                Reply reply = replyRepository.findById(replyId)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 댓글입니다."));
                Post parentPost = reply.getPostId();
                return ReportTargetContentDTO.builder()
                                .targetType(ReportTargetType.REPLY)
                                .targetId(replyId)
                                .deleted(reply.isDeleted())
                                .linkUrl(buildPostLinkUrl(parentPost))
                                .replyContent(reply.getContent())
                                .replyAuthorName(reply.getUserId().getName())
                                .replyPostId(parentPost.getPostId())
                                .replyPostTitle(parentPost.getTitle())
                                .replyCreatedAt(reply.getCreateDate())
                                .build();
        }

        private ReportTargetContentDTO fetchCircleContent(Long circleId) {
                Circle circle = circleRepository.findById(circleId)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 모임입니다."));
                return ReportTargetContentDTO.builder()
                                .targetType(ReportTargetType.CIRCLE)
                                .targetId(circleId)
                                .deleted(false)
                                .linkUrl("/circle/" + circleId)
                                .circleName(circle.getName())
                                .circleDescription(circle.getDescription())
                                .circleStatus(circle.getStatus().name())
                                .circleMaxMember(circle.getMaxMember())
                                .circleCurrentMember(circle.getCurrentMember())
                                .circleCreatedAt(circle.getCreateDate())
                                .build();
        }

        private ReportTargetContentDTO fetchPlaceReviewContent(Long reviewId) {
                PlaceReview review = placeReviewRepository.findById(reviewId)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 리뷰입니다."));
                return ReportTargetContentDTO.builder()
                                .targetType(ReportTargetType.PLACE_REVIEW)
                                .targetId(reviewId)
                                .deleted(false)
                                .linkUrl("/place/" + review.getPlace().getId())
                                .placeReviewContent(review.getComment())
                                .placeReviewRating(review.getRating())
                                .placeReviewAuthorName(review.getReviewer().getNickname())
                                .placeReviewPlaceName(review.getPlace().getName())
                                .placeReviewPlaceId(review.getPlace().getId())
                                .placeReviewCreatedAt(review.getCreateDate())
                                .build();
        }

        private ReportTargetContentDTO fetchUserContent(Long userId) {
                Users user = adminUsersRepository.findById(userId)
                                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

                // 최근 게시글 5개
                List<ReportTargetContentDTO.UserRecentActivityDTO> postActivities = user.getPosts().stream()
                                .sorted(Comparator.comparing(Post::getCreateDate).reversed())
                                .limit(5)
                                .map(p -> UserRecentActivityDTO.builder()
                                                .type("POST")
                                                .id(p.getPostId())
                                                .title(p.getTitle())
                                                .content(p.getContent().length() > 100
                                                                ? p.getContent().substring(0, 100) + "..."
                                                                : p.getContent())
                                                .createdAt(p.getCreateDate())
                                                .build())
                                .toList();

                // 최근 댓글 5개
                List<ReportTargetContentDTO.UserRecentActivityDTO> replyActivities = user.getReplies().stream()
                                .sorted(Comparator.comparing(Reply::getCreateDate).reversed())
                                .limit(5)
                                .map(r -> UserRecentActivityDTO.builder()
                                                .type("REPLY")
                                                .id(r.getReplyId())
                                                .title(r.getPostId().getTitle())
                                                .content(r.getContent().length() > 100
                                                                ? r.getContent().substring(0, 100) + "..."
                                                                : r.getContent())
                                                .createdAt(r.getCreateDate())
                                                .build())
                                .toList();

                // 합쳐서 최신순 정렬, 최대 5개
                List<UserRecentActivityDTO> recentActivities = Stream.concat(
                                postActivities.stream(), replyActivities.stream())
                                .sorted(Comparator.comparing(UserRecentActivityDTO::createdAt).reversed())
                                .limit(5)
                                .toList();

                return ReportTargetContentDTO.builder()
                                .targetType(ReportTargetType.USER)
                                .targetId(userId)
                                .deleted(false)
                                .userNickname(user.getNickname())
                                .userEmail(user.getEmail())
                                .userStatus(user.getUserStatus().name())
                                .userSanctionCount(user.getSanctionCount())
                                .userRecentActivities(recentActivities)
                                .build();
        }

}
