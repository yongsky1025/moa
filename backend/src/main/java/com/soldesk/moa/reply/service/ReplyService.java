package com.soldesk.moa.reply.service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.service.CirclePermissionService;
import com.soldesk.moa.common.exception.InvalidRequestException;
import com.soldesk.moa.common.service.ProfanityFilterService;
import com.soldesk.moa.post.entity.Post;
import com.soldesk.moa.post.repository.PostRepository;
import com.soldesk.moa.reply.dto.ReplyRequestDTO;
import com.soldesk.moa.reply.dto.ReplyReactionSummaryDTO;
import com.soldesk.moa.reply.dto.ReplyResponseDTO;
import com.soldesk.moa.reply.entity.Reply;
import com.soldesk.moa.reply.entity.ReplyReaction;
import com.soldesk.moa.reply.entity.constant.ReplyReactionType;
import com.soldesk.moa.reply.exception.ReplyForbiddenException;
import com.soldesk.moa.reply.exception.ReplyNotFoundException;
import com.soldesk.moa.reply.repository.ReplyReactionRepository;
import com.soldesk.moa.reply.repository.ReplyRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.repository.UsersRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReplyService {

    private final ReplyRepository replyRepository;
    private final PostRepository postRepository;
    private final UsersRepository usersRepository;
    private final CirclePermissionService circlePermissionService;
    private final ProfanityFilterService profanityFilterService;
    private final ReplyReactionRepository replyReactionRepository;

    // 댓글 리스트
    public Page<ReplyResponseDTO> list(Long postId, Long userId, int page, int size) {
        Post post = postRepository.findByPostIdAndDeletedFalseAndBoardId_DeletedFalse(postId)
                .orElseThrow(() -> new ReplyNotFoundException("[#REPLY] 게시글을 찾을 수 없습니다."));
        requireReadPermission(post, userId);

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        Pageable pageable = PageRequest.of(safePage, safeSize);
        Map<Long, Long> childCountByParentId = buildRootChildCountMap(postId);

        Page<Reply> replies = replyRepository.findByPostId_PostIdOrderByCreateDateAscReplyIdAsc(postId, pageable);
        Map<Long, String> myReactionByReplyId = buildMyReactionMap(replies.getContent(), userId);

        return replies.map((reply) -> toResponse(reply, childCountByParentId, myReactionByReplyId));
    }

    // 댓글 생성
    @Transactional
    public Long createReply(Long postId, Long userId, ReplyRequestDTO req) {
        validateReplyText(req);
        requireAuthenticated(userId, "[#REPLY] 로그인 후 댓글을 작성할 수 있습니다.");
        Post post = postRepository.findByPostIdAndDeletedFalseAndBoardId_DeletedFalse(postId)
                .orElseThrow(() -> new ReplyNotFoundException("[#REPLY] 게시글을 찾을 수 없습니다."));
        requireWritePermission(post, userId);

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ReplyNotFoundException("[#REPLY] 사용자를 찾을 수 없습니다."));

        Reply reply = Reply.builder()
                .postId(post)
                .userId(user)
                .content(req.getContent())
                .parentId(null)
                .replyToUserId(null)
                .build();

        return replyRepository.save(reply).getReplyId();
    }

    // 대댓글 생성
    @Transactional
    public Long createChildReply(Long postId, Long parentReplyId, Long userId, ReplyRequestDTO req) {
        validateReplyText(req);
        requireAuthenticated(userId, "[#REPLY] 로그인 후 대댓글을 작성할 수 있습니다.");
        Reply target = replyRepository.findById(parentReplyId)
                .orElseThrow(() -> new ReplyNotFoundException("[#REPLY] 부모 댓글을 찾을 수 없습니다."));

        if (!target.getPostId().getPostId().equals(postId)) {
            throw new ReplyForbiddenException("[#REPLY] 해당 게시글에 속한 댓글이 아닙니다.");
        }

        Reply rootParent = findRootReply(target);
        requireWritePermission(target.getPostId(), userId);

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ReplyNotFoundException("[#REPLY] 사용자를 찾을 수 없습니다."));

        Reply reply = Reply.builder()
                .postId(target.getPostId())
                .userId(user)
                .content(req.getContent())
                .parentId(rootParent)
                .replyToUserId(target.getUserId())
                .build();

        return replyRepository.save(reply).getReplyId();
    }

    // 댓글 수정
    @Transactional
    public Long update(Long replyId, Long userId, ReplyRequestDTO req) {
        validateReplyText(req);
        requireAuthenticated(userId, "[#REPLY] 로그인 후 댓글을 수정할 수 있습니다.");
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ReplyNotFoundException("[#REPLY] 댓글을 찾을 수 없습니다."));
        requireWritePermission(reply.getPostId(), userId);

        if (!circlePermissionService.canEditOwnContent(reply.getUserId().getUserId(), userId)) {
            throw new ReplyForbiddenException("[#REPLY] 작성자만 수정할 수 있습니다.");
        }

        reply.changeContent(req.getContent());
        return reply.getReplyId();
    }

    // 댓글 삭제
    @Transactional
    public void delete(Long replyId, Long userId) {
        requireAuthenticated(userId, "[#REPLY] 로그인 후 댓글을 삭제할 수 있습니다.");
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ReplyNotFoundException("[#REPLY] 댓글을 찾을 수 없습니다."));
        Post post = reply.getPostId();
        requireWritePermission(post, userId);

        boolean owner = circlePermissionService.canEditOwnContent(reply.getUserId().getUserId(), userId);
        if (!owner) {
            Long circleId = getCircleIdIfCirclePost(post);
            if (circleId != null) {
                // circle은 리더가 댓글 삭제 가능
                circlePermissionService.requireLeader(circleId, userId);
            } else if (!isAdmin(userId)) {
                throw new ReplyForbiddenException("[#REPLY] 작성자만 삭제할 수 있습니다.");
            }
        }

        reply.markDeleted();
    }

    @Transactional
    public ReplyReactionSummaryDTO reactToReply(Long postId, Long replyId, Long userId) {
        requireAuthenticated(userId, "[#REPLY] 로그인 후 좋아요를 누를 수 있습니다.");
        Post post = postRepository.findByPostIdAndDeletedFalseAndBoardId_DeletedFalse(postId)
                .orElseThrow(() -> new ReplyNotFoundException("[#REPLY] 게시글을 찾을 수 없습니다."));
        requireReactionPermission(post, userId);

        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ReplyNotFoundException("[#REPLY] 댓글을 찾을 수 없습니다."));

        if (!reply.getPostId().getPostId().equals(postId)) {
            throw new ReplyForbiddenException("[#REPLY] 해당 게시글에 속한 댓글이 아닙니다.");
        }
        if (reply.isDeleted()) {
            throw new ReplyNotFoundException("[#REPLY] 삭제된 댓글입니다.");
        }

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ReplyNotFoundException("[#REPLY] 사용자를 찾을 수 없습니다."));

        ReplyReaction existing = replyReactionRepository.findByReply_ReplyIdAndUser_UserId(replyId, userId)
                .orElse(null);

        String myReaction = "LIKE";
        if (existing == null) {
            replyReactionRepository.save(ReplyReaction.builder()
                    .reply(reply)
                    .user(user)
                    .reactionType(ReplyReactionType.LIKE)
                    .build());
            replyRepository.incrementLikeCount(replyId);
        } else if (existing.getReactionType() == ReplyReactionType.LIKE) {
            replyReactionRepository.delete(existing);
            replyRepository.decrementLikeCount(replyId);
            myReaction = null;
        } else {
            throw new InvalidRequestException("[#REPLY] 지원하지 않는 반응 타입입니다.");
        }

        return buildReactionSummary(replyId, myReaction);
    }

    // dto
    private ReplyResponseDTO toResponse(Reply r, Map<Long, Long> childCountByParentId,
            Map<Long, String> myReactionByReplyId) {
        String content = r.isDeleted() ? "삭제된 댓글입니다." : r.getContent();
        String author = r.isDeleted() ? "" : r.getUserId().getName();
        String authorPublicId = r.isDeleted() ? null : r.getUserId().getPublicId();
        Long authorUserId = r.isDeleted() ? null : r.getUserId().getUserId();
        Reply rootReply = findRootReply(r);
        Long normalizedParentId = r.getParentId() == null ? null : rootReply.getReplyId();
        int depth = r.getParentId() == null ? 0 : 1;
        long replyCount = childCountByParentId.getOrDefault(r.getReplyId(), 0L);
        String myReaction = r.isDeleted() ? null : myReactionByReplyId.get(r.getReplyId());

        return ReplyResponseDTO.builder()
                .replyId(r.getReplyId())
                .content(content)
                .authorName(author)
                .authorPublicId(authorPublicId)
                .authorUserId(authorUserId)
                .createDate(r.getCreateDate())
                .parentId(normalizedParentId)
                .depth(depth)
                .replyToUserId(r.getReplyToUserId() != null ? r.getReplyToUserId().getUserId() : null)
                .deleted(r.isDeleted())
                .likeCount(r.getLikeCount())
                .myReaction(myReaction)
                .replyCount(replyCount)
                .build();
    }

    private void requireReadPermission(Post post, Long userId) {
        Long circleId = getCircleIdIfCirclePost(post);
        if (circleId == null) {
            return;
        }
        requireAuthenticated(userId, "[#REPLY] 로그인 후 접근할 수 있습니다.");
        circlePermissionService.requireActiveMember(circleId, userId);
    }

    private void requireWritePermission(Post post, Long userId) {
        Long circleId = getCircleIdIfCirclePost(post);
        if (circleId == null) {
            return;
        }
        circlePermissionService.requireActiveMember(circleId, userId);
    }

    private void requireReactionPermission(Post post, Long userId) {
        Long circleId = getCircleIdIfCirclePost(post);
        if (circleId == null) {
            return;
        }
        circlePermissionService.requireActiveMember(circleId, userId);
    }

    private void requireAuthenticated(Long userId, String message) {
        if (userId == null) {
            throw new ReplyForbiddenException(message);
        }
    }

    private boolean isAdmin(Long userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ReplyNotFoundException("[#REPLY] 사용자를 찾을 수 없습니다."));
        return user.getUserRole() == UserRole.ADMIN;
    }

    private Long getCircleIdIfCirclePost(Post post) {
        if (post.getBoardId().getBoardType() != BoardType.CIRCLE || post.getBoardId().getCircleId() == null) {
            return null;
        }
        return post.getBoardId().getCircleId().getCircleId();
    }

    private void validateReplyText(ReplyRequestDTO req) {
        profanityFilterService.validateNoProfanity(
                req.getContent(),
                "[#REPLY] 댓글에 사용할 수 없는 표현이 포함되어 있습니다.");
    }

    private Reply findRootReply(Reply reply) {
        Reply current = reply;
        while (current.getParentId() != null) {
            current = current.getParentId();
        }
        return current;
    }

    private Map<Long, Long> buildRootChildCountMap(Long postId) {
        List<Reply> allReplies = replyRepository.findByPostId_PostIdOrderByCreateDateAsc(postId);
        Map<Long, Long> countByRootId = new HashMap<>();
        for (Reply reply : allReplies) {
            if (reply.getParentId() == null) {
                continue;
            }
            Long rootId = findRootReply(reply).getReplyId();
            countByRootId.merge(rootId, 1L, Long::sum);
        }
        return countByRootId;
    }

    private Map<Long, String> buildMyReactionMap(List<Reply> replies, Long userId) {
        if (userId == null || replies.isEmpty()) {
            return Collections.emptyMap();
        }

        List<Long> replyIds = replies.stream()
                .map(Reply::getReplyId)
                .toList();

        return replyReactionRepository.findByUser_UserIdAndReply_ReplyIdIn(userId, replyIds).stream()
                .collect(Collectors.toMap(
                        reaction -> reaction.getReply().getReplyId(),
                        reaction -> reaction.getReactionType().name()));
    }

    private ReplyReactionSummaryDTO buildReactionSummary(Long replyId, String myReaction) {
        Reply refreshed = replyRepository.findById(replyId)
                .orElseThrow(() -> new ReplyNotFoundException("[#REPLY] 댓글을 찾을 수 없습니다."));
        return ReplyReactionSummaryDTO.builder()
                .likeCount(refreshed.getLikeCount())
                .myReaction(myReaction)
                .build();
    }

}
