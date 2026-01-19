package com.soldesk.moa.board.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.dto.BoardDTO;
import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.repository.BoardRepository;
import com.soldesk.moa.users.entity.Users;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;

    private BoardDTO toDto(Board board) {
        return BoardDTO.builder()
                .bno(board.getBno())
                .title(board.getTitle())
                .content(board.getContent())
                .writer(board.getWriter())
                .viewCount(board.getViewCount())
                .createDate(board.getCreateDate())
                .build();
    }

    @Transactional(readOnly = true)
    public List<BoardDTO> getBoardsByType(BoardType boardType) {
        return boardRepository.findByBoardType(boardType).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public BoardDTO getNoticeRead(Long bno) {
        Board board = boardRepository.findById(bno).orElseThrow();
        board.upViewCount(board.getViewCount() + 1);

        BoardDTO dto = BoardDTO.builder()
                .bno(board.getBno())
                .title(board.getTitle())
                .content(board.getContent())
                .writer(board.getWriter())
                .viewCount(board.getViewCount())
                .createDate(board.getCreateDate())
                .build();

        return dto;
    }
}
