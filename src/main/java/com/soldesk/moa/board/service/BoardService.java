package com.soldesk.moa.board.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.dto.BoardRequestDTO;
import com.soldesk.moa.board.dto.BoardResponseDTO;
import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.repository.BoardRepository;
import com.soldesk.moa.board.repository.PostRepository;
import com.soldesk.moa.circle.entity.Circle;
import com.soldesk.moa.circle.repository.CircleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
@RequiredArgsConstructor
@Transactional
public class BoardService {

    private final BoardRepository boardRepository;
    private final CircleRepository circleRepository; // Circle board 생성 시 필요

    // ===== Global boards =====
    public List<BoardResponseDTO> listGlobalBoards() {
        return List.of(BoardType.NOTICE, BoardType.FREE, BoardType.SUPPORT).stream()
                .map(this::getGlobalBoardOrThrow)
                .map(this::toBoardResponse)
                .toList();
    }

    public BoardResponseDTO readGlobalBoard(BoardType type) {
        Board b = getGlobalBoardOrThrow(type);
        return toBoardResponse(b);
    }

    @Transactional
    public Long updateBoardName(Long boardId, String newName) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new NotFoundException("board not found"));
        board.changeName(newName);
        return board.getBoardId();
    }

    private Board getGlobalBoardOrThrow(BoardType type) {
        if (type == BoardType.CIRCLE) {
            throw new IllegalArgumentException("CIRCLE is not global");
        }
        return boardRepository.findByBoardTypeAndCircleIdIsNull(type)
                .orElseThrow(() -> new NotFoundException("global board not found: " + type));
    }

    // ===== Circle boards =====

    public List<BoardResponseDTO> listCircleBoards(Long circleId) {
        return boardRepository
                .findByBoardTypeAndCircleId_CircleId(BoardType.CIRCLE, circleId)
                .stream()
                .map(this::toBoardResponse)
                .toList();
    }

    @Transactional
    public Long createCircleBoard(BoardRequestDTO dto) {
        if (dto.getBoardType() != BoardType.CIRCLE) {
            throw new IllegalArgumentException("only CIRCLE board can be created here");
        }
        if (dto.getCircleId() == null) {
            throw new IllegalArgumentException("circleId is required for CIRCLE board");
        }

        Circle circle = circleRepository.findById(dto.getCircleId())
                .orElseThrow(() -> new NotFoundException("circle not found"));

        Board board = Board
                .builder()
                .boardType(BoardType.CIRCLE)
                .name(dto.getName())
                .circleId(circle)
                .build();

        return boardRepository.save(board).getBoardId();
    }

    @Transactional
    public Long updateCircleBoardName(Long circleId, Long boardId, String newName) {
        Board board = boardRepository
                .findByBoardIdAndBoardTypeAndCircleId_CircleId(
                        boardId, BoardType.CIRCLE, circleId)
                .orElseThrow(() -> new NotFoundException("board not found"));

        board.changeName(newName);
        return board.getBoardId();
    }

    @Transactional
    public void deleteCircleBoard(Long circleId, Long boardId) {
        Board board = boardRepository
                .findByBoardIdAndBoardTypeAndCircleId_CircleId(
                        boardId, BoardType.CIRCLE, circleId)
                .orElseThrow(() -> new NotFoundException("board not found"));

        boardRepository.delete(board);
    }

    private BoardResponseDTO toBoardResponse(Board b) {
        BoardResponseDTO dto = BoardResponseDTO
                .builder()
                .boardId(b.getBoardId())
                .boardType(b.getBoardType())
                .name(b.getName())
                .circleId(b.getCircleId() == null ? null : b.getCircleId().getCircleId()) // PK명 맞춰 수정
                .createDate(b.getCreateDate())
                .updateDate(b.getUpdateDate())
                .build();
        return dto;
    }
}
