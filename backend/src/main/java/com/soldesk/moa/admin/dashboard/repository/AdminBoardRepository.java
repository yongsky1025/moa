package com.soldesk.moa.admin.dashboard.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.board.board.entity.Board;

public interface AdminBoardRepository extends JpaRepository<Board, Long> {

}
