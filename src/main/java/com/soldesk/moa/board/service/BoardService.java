package com.soldesk.moa.board.service;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.dto.BoardDTO;
import com.soldesk.moa.board.dto.PostDTO;
import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.Post;
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
    private final CircleRepository circleRepository;

    // 보드 리스트 출력
    public List<BoardDTO> BoardList() {

        List<Board> boards = boardRepository.findAll();

        return boards.stream()
                .map(board -> BoardDTO.builder()
                        .boardId(board.getBoardId())
                        .boardRole(board.getBoardRole())
                        .name(board.getName())
                        .circleId(board.getCircleId() != null ? board.getCircleId().getCircleId() : null)
                        .build())
                .collect(Collectors.toList());
    }

    // 보드 생성
    public Long create(BoardDTO dto) {
        Circle circle = null;
        if (dto.getCircleId() != null)
            circle = circleRepository.findById(dto.getCircleId())
                    .orElseThrow(() -> new IllegalArgumentException("Circle not found: " + dto.getCircleId()));

        Board board = Board.builder()
                .boardRole(dto.getBoardRole())
                .name(dto.getName())
                .circleId(circle)
                .build();

        return boardRepository.save(board).getBoardId();
    }

    // 보드 수정
    public Long update(BoardDTO dto) {

        Board board = boardRepository.findById(dto.getBoardId())
                .orElseThrow(() -> new IllegalArgumentException("Board not found: " + dto.getBoardId()));

        board.changeName(dto.getName());

        return board.getBoardId();
    }

    // 보드 삭제
    public void delete(Long boardId) {
        boardRepository.deleteById(boardId);
    }

}
