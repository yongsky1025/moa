package com.soldesk.moa.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.board.entity.Board;

public interface AdminBoardRepository extends JpaRepository<Board, Long> {

}
