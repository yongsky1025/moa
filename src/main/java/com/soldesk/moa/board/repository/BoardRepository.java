package com.soldesk.moa.board.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.entity.constant.BoardRole;

public interface BoardRepository extends JpaRepository<Post, Long> {
}
