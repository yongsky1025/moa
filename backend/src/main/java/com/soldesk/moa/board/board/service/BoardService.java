package com.soldesk.moa.board.board.service;

import java.util.List;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.board.dto.BoardRequestDTO;
import com.soldesk.moa.board.board.dto.BoardResponseDTO;
import com.soldesk.moa.board.board.entity.Board;
import com.soldesk.moa.board.board.entity.constant.BoardType;
import com.soldesk.moa.board.common.exception.BadRequestException;
import com.soldesk.moa.board.common.exception.NotFoundException;
import com.soldesk.moa.board.board.repository.BoardRepository;
import com.soldesk.moa.board.post.repository.PostRepository;
import com.soldesk.moa.board.reply.repository.ReplyRepository;
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
    private final PostRepository postRepository;
    private final ReplyRepository replyRepository;

    // ===== Global boards =====
    public List<BoardResponseDTO> listGlobalBoards() {
        return List.of(BoardType.NOTICE, BoardType.FREE).stream()
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
        if (board.isDeleted()) {
            throw new BadRequestException("deleted board cannot be updated");
        }
        board.changeName(newName);
        return board.getBoardId();
    }

    private Board getGlobalBoardOrThrow(BoardType type) {
        if (type == BoardType.CIRCLE) {
            throw new IllegalArgumentException("CIRCLE is not global");
        }
        return boardRepository.findByBoardTypeAndCircleIdIsNullAndDeletedFalse(type)
                .orElseThrow(() -> new NotFoundException("global board not found: " + type));
    }

    // ===== Circle boards =====

    public List<BoardResponseDTO> listCircleBoards(Long circleId) {
        return boardRepository
                .findByBoardTypeAndCircleId_CircleIdAndDeletedFalse(BoardType.CIRCLE, circleId)
                .stream()
                .map(this::toBoardResponse)
                .toList();
    }

    public BoardResponseDTO readCircleBoard(Long circleId, Long boardId) {
        Board board = boardRepository
                .findByBoardIdAndBoardTypeAndCircleId_CircleIdAndDeletedFalse(boardId, BoardType.CIRCLE, circleId)
                .orElseThrow(() -> new NotFoundException("board not found"));
        return toBoardResponse(board);
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
        if (board.isDeleted()) {
            throw new BadRequestException("deleted board cannot be updated");
        }

        board.changeName(newName);
        return board.getBoardId();
    }

    @Transactional
    public void deleteCircleBoard(Long circleId, Long boardId) {
        Board board = boardRepository
                .findByBoardIdAndBoardTypeAndCircleId_CircleId(
                        boardId, BoardType.CIRCLE, circleId)
                .orElseThrow(() -> new NotFoundException("board not found"));

        if (board.isDeleted()) {
            return;
        }

        LocalDateTime deletedAt = LocalDateTime.now();
        board.markDeleted(deletedAt);
        postRepository.softDeleteByBoardId(board.getBoardId(), deletedAt);
        replyRepository.softDeleteByBoardId(board.getBoardId(), deletedAt);
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
