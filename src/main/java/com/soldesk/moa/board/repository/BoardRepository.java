package com.soldesk.moa.board.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.board.entity.Board;

public interface BoardRepository extends JpaRepository<Board, Long> {

}
