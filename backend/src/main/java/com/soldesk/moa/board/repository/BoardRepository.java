package com.soldesk.moa.board.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.constant.BoardType;

public interface BoardRepository extends JpaRepository<Board, Long> {

    // Global 고정 보드 찾기 (NOTICE/FREE/SUPPORT)
    Optional<Board> findByBoardTypeAndCircleIdIsNullAndDeletedFalse(BoardType type);

    // Circle 보드 검증: boardId + circleId가 맞는지
    Optional<Board> findByBoardIdAndBoardTypeAndCircleId_CircleIdAndDeletedFalse(Long boardId, BoardType type,
            Long circleId);

    List<Board> findByBoardTypeAndCircleId_CircleIdAndDeletedFalse(BoardType boardType, Long circleId);

    Optional<Board> findByBoardIdAndDeletedFalse(Long boardId);

}
