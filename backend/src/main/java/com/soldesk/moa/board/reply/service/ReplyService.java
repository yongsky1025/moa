package com.soldesk.moa.board.reply.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.common.exception.ForbiddenException;
import com.soldesk.moa.board.common.exception.NotFoundException;
import com.soldesk.moa.board.reply.dto.ReplyRequestDTO;
import com.soldesk.moa.board.reply.dto.ReplyResponseDTO;
import com.soldesk.moa.board.post.entity.Post;
import com.soldesk.moa.board.reply.entity.Reply;
import com.soldesk.moa.board.post.repository.PostRepository;
import com.soldesk.moa.board.reply.repository.ReplyRepository;
import com.soldesk.moa.users.entity.Users;
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

    // 댓글 리스트
    public List<ReplyResponseDTO> list(Long postId) {
        return replyRepository.findByPostId_PostIdOrderByCreateDateAsc(postId).stream()
                .map(this::toResponse)
                .toList();
    }

    // 댓글 생성
    @Transactional
    public Long createReply(Long postId, Long userId, ReplyRequestDTO req) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("post not found"));
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("user not found"));

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
        Reply parent = replyRepository.findById(parentReplyId)
                .orElseThrow(() -> new NotFoundException("parent reply not found"));

        if (!parent.getPostId().getPostId().equals(postId)) {
            throw new ForbiddenException("reply not in post");
        }

        int nextDepth = parent.getDepth() + 1;
        if (nextDepth > 2) {
            throw new ForbiddenException("max reply depth");
        }

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("user not found"));

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
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new NotFoundException("reply not found"));

        if (!reply.getUserId().getUserId().equals(userId)) {
            throw new ForbiddenException("not owner");
        }

        reply.changeContent(req.getContent());
        return reply.getReplyId();
    }

    // 댓글 삭제
    @Transactional
    public void delete(Long replyId, Long userId) {
        Reply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new NotFoundException("reply not found"));

        if (!reply.getUserId().getUserId().equals(userId)) {
            throw new ForbiddenException("not owner");
        }

        reply.changeContent("삭제된 댓글입니다.");
        reply.markDeleted();
    }

    // dto
    private ReplyResponseDTO toResponse(Reply r) {
        String content = r.isDeleted() ? "삭제된 댓글입니다." : r.getContent();
        String author = r.isDeleted() ? "" : r.getUserId().getName();

        return ReplyResponseDTO.builder()
                .replyId(r.getReplyId())
                .content(content)
                .authorName(author)
                .createDate(r.getCreateDate())
                .parentId(r.getParentId() != null ? r.getParentId().getReplyId() : null)
                .depth(r.getDepth())
                .deleted(r.isDeleted())
                .build();
    }

}
