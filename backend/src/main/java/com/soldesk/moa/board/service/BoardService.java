package com.soldesk.moa.board.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.dto.BoardRequestDTO;
import com.soldesk.moa.board.dto.BoardResponseDTO;
import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.exception.BoardNotFoundException;
import com.soldesk.moa.board.exception.CircleBoardCreationNotAllowedException;
import com.soldesk.moa.board.exception.CircleNotFoundException;
import com.soldesk.moa.board.exception.GlobalBoardTypeInvalidException;
import com.soldesk.moa.board.exception.InvalidBoardTypeException;
import com.soldesk.moa.board.exception.MissingCircleIdException;
import com.soldesk.moa.board.repository.BoardRepository;
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
    private final CirclePermissionService circlePermissionService;

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
                .orElseThrow(() -> new BoardNotFoundException("[#BOARD] 게시판을 찾을 수 없습니다."));
        board.changeName(newName);
        return board.getBoardId();
    }

    private Board getGlobalBoardOrThrow(BoardType type) {
        if (type == BoardType.CIRCLE) {
            throw new GlobalBoardTypeInvalidException("[#BOARD] CIRCLE 타입은 글로벌 게시판이 아닙니다.");
        }
        return boardRepository.findByBoardTypeAndCircleIdIsNull(type)
                .orElseThrow(() -> new InvalidBoardTypeException("[#BOARD] 잘못된 게시판 타입입니다."));
    }

    // ===== Circle boards =====

    public List<BoardResponseDTO> listCircleBoards(Long circleId, Long userId) {
        circlePermissionService.requireActiveMember(circleId, userId);
        return boardRepository
                .findByBoardTypeAndCircleId_CircleId(BoardType.CIRCLE, circleId)
                .stream()
                .map(this::toBoardResponse)
                .toList();
    }

    @Transactional
    public Long createCircleBoard(BoardRequestDTO dto, Long userId) {
        if (dto.getBoardType() != BoardType.CIRCLE) {
            throw new CircleBoardCreationNotAllowedException("[#BOARD] 이 API에서는 CIRCLE 게시판만 생성할 수 있습니다.");
        }
        if (dto.getCircleId() == null) {
            throw new MissingCircleIdException("[#BOARD] CIRCLE 게시판 생성 시 circleId는 필수입니다.");
        }
        circlePermissionService.requireLeader(dto.getCircleId(), userId);

        Circle circle = circleRepository.findById(dto.getCircleId())
                .orElseThrow(() -> new CircleNotFoundException(dto.getCircleId()));

        Board board = Board
                .builder()
                .boardType(BoardType.CIRCLE)
                .name(dto.getName())
                .circleId(circle)
                .build();

        return boardRepository.save(board).getBoardId();
    }

    @Transactional
    public Long updateCircleBoardName(Long circleId, Long boardId, String newName, Long userId) {
        circlePermissionService.requireLeader(circleId, userId);
        Board board = boardRepository
                .findByBoardIdAndBoardTypeAndCircleId_CircleId(
                        boardId, BoardType.CIRCLE, circleId)
                .orElseThrow(() -> new BoardNotFoundException("[#BOARD] 게시판을 찾을 수 없습니다."));

        board.changeName(newName);
        return board.getBoardId();
    }

    @Transactional
    public void deleteCircleBoard(Long circleId, Long boardId, Long userId) {
        circlePermissionService.requireLeader(circleId, userId);
        Board board = boardRepository
                .findByBoardIdAndBoardTypeAndCircleId_CircleId(
                        boardId, BoardType.CIRCLE, circleId)
                .orElseThrow(() -> new BoardNotFoundException("[#BOARD] 게시판을 찾을 수 없습니다."));

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
