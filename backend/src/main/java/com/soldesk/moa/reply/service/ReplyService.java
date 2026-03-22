package com.soldesk.moa.reply.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.service.CirclePermissionService;
import com.soldesk.moa.common.service.ProfanityFilterService;
import com.soldesk.moa.post.entity.Post;
import com.soldesk.moa.post.repository.PostRepository;
import com.soldesk.moa.reply.dto.ReplyRequestDTO;
import com.soldesk.moa.reply.dto.ReplyResponseDTO;
import com.soldesk.moa.reply.entity.Reply;
import com.soldesk.moa.reply.exception.ReplyDepthExceededException;
import com.soldesk.moa.reply.exception.ReplyForbiddenException;
import com.soldesk.moa.reply.exception.ReplyNotFoundException;
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

    // 댓글 리스트
    public List<ReplyResponseDTO> list(Long postId, Long userId) {
        Post post = postRepository.findByPostIdAndDeletedFalseAndBoardId_DeletedFalse(postId)
                .orElseThrow(() -> new ReplyNotFoundException("[#REPLY] 게시글을 찾을 수 없습니다."));
        requireReadPermission(post, userId);

        return replyRepository.findByPostId_PostIdOrderByCreateDateAsc(postId).stream()
                .map(this::toResponse)
                .toList();
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
                .depth(0)
                .build();

        return replyRepository.save(reply).getReplyId();
    }

    // 대댓글 생성
    @Transactional
    public Long createChildReply(Long postId, Long parentReplyId, Long userId, ReplyRequestDTO req) {
        validateReplyText(req);
        requireAuthenticated(userId, "[#REPLY] 로그인 후 대댓글을 작성할 수 있습니다.");
        Reply parent = replyRepository.findById(parentReplyId)
                .orElseThrow(() -> new ReplyNotFoundException("[#REPLY] 부모 댓글을 찾을 수 없습니다."));

        if (!parent.getPostId().getPostId().equals(postId)) {
            throw new ReplyForbiddenException("[#REPLY] 해당 게시글에 속한 댓글이 아닙니다.");
        }

        int nextDepth = parent.getDepth() + 1;
        if (nextDepth > 2) {
            throw new ReplyDepthExceededException("[#REPLY] 대댓글 깊이 제한을 초과했습니다.");
        }
        requireWritePermission(parent.getPostId(), userId);

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ReplyNotFoundException("[#REPLY] 사용자를 찾을 수 없습니다."));

        Reply reply = Reply.builder()
                .postId(parent.getPostId())
                .userId(user)
                .content(req.getContent())
                .parentId(parent)
                .depth(nextDepth)
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

    // dto
    private ReplyResponseDTO toResponse(Reply r) {
        String content = r.isDeleted() ? "삭제된 댓글입니다." : r.getContent();
        String author = r.isDeleted() ? "" : r.getUserId().getName();
        String authorPublicId = r.isDeleted() ? null : r.getUserId().getPublicId();

        return ReplyResponseDTO.builder()
                .replyId(r.getReplyId())
                .content(content)
                .authorName(author)
                .authorPublicId(authorPublicId)
                .createDate(r.getCreateDate())
                .parentId(r.getParentId() != null ? r.getParentId().getReplyId() : null)
                .depth(r.getDepth())
                .deleted(r.isDeleted())
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

}
