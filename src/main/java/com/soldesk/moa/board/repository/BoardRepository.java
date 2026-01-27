package com.soldesk.moa.board.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.entity.constant.BoardType;

public interface BoardRepository extends JpaRepository<Board, Long> {

    // Global 고정 보드 찾기 (NOTICE/FREE/SUPPORT)
    Optional<Board> findByBoardTypeAndCircleIdIsNull(BoardType type);

    // Circle 보드 검증: boardId + circleId가 맞는지
    // ⚠️ Circle PK 필드명이 circleId가 아니라면 여기 수정 필요
    Optional<Board> findByBoardIdAndBoardTypeAndCircleId_CircleId(Long boardId, BoardType type, Long circleId);

    List<Board> findByBoardTypeAndCircleId_CircleId(BoardType boardType, Long circleId);

}
