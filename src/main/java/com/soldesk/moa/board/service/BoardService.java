package com.soldesk.moa.board.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.dto.PostDTO;
import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.repository.PostRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
@RequiredArgsConstructor
public class BoardService {

    // @Transactional(readOnly = true)
    // public List<BoardDTO> getBoardList(Long boardId) {

    // List<BoardDTO> result = boardRepository.findByBoardPost(boardId);

    // };

}
