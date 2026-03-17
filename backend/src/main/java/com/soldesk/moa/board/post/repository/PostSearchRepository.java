package com.soldesk.moa.board.post.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.soldesk.moa.board.post.dto.PostCardResponseDTO;
import com.soldesk.moa.board.board.entity.constant.BoardType;

public interface PostSearchRepository {

    Page<Object[]> searchPostsWithReplyCount(BoardType boardType, Long circleId, Long boardId, String keyword,
            Pageable pageable);

    Page<PostCardResponseDTO> searchPostCards(BoardType boardType, Long circleId, Long boardId, String keyword,
            Pageable pageable);
}
