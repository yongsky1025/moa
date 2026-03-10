package com.soldesk.moa.board.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.board.entity.Reply;

public interface ReplyRepository extends JpaRepository<Reply, Long> {

    // 게시글별 댓글 목록 (작성일 순)
    List<Reply> findByPostId_PostIdOrderByCreateDateAsc(Long postId);

    // 부모 댓글의 자식 댓글 삭제 (부모 삭제 전에 호출)
    void deleteByParentId_ReplyId(Long parentId);

    // (선택) 게시글별 댓글 개수
    long countByPostId_PostId(Long postId);

    void deleteByPostId_PostId(Long postId);

}
