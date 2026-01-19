package com.soldesk.moa.board.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.constant.BoardType;

public interface BoardRepository extends JpaRepository<Board, Long> {

    List<Board> findByBoardType(BoardType boardType);

    // 게시판 상세 (작성자join)
    @Query("select b from Board b join fetch b.userId where b.bno = :bno")
    Optional<Board> findBoardWithWriter(@Param("bno") Long bno);

    // 전체 목록 (작성자join)
    @Query("select b from Board b join fetch b.userId order by b.bno desc")
    List<Board> findAllWithWriter();

}
