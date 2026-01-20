package com.soldesk.moa.board.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.dto.BoardCreateRequest;
import com.soldesk.moa.board.dto.BoardDTO;
import com.soldesk.moa.board.dto.BoardUpdateRequest;
import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.repository.BoardRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

import jakarta.persistence.EnumType;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
public class BoardService {

    private final UsersRepository usersRepository;

    private final BoardRepository boardRepository;

    private BoardDTO toDto(Board board) {

        String writerName = board.getUserId().getNickname();

        // 보드 기본dto 틀
        return BoardDTO.builder()
                .bno(board.getBno())
                .title(board.getTitle())
                .content(board.getContent())
                .writer(writerName)
                .viewCount(board.getViewCount())
                .createDate(board.getCreateDate())
                .build();
    }

    // 타입으로 보드리스트 호출
    @Transactional(readOnly = true)
    public List<BoardDTO> getBoardByType(BoardType boardType) {
        return boardRepository.findByBoardType(boardType).stream()
                .map(this::toDto)
                .toList();
    }

    // 작성자 join 게시판 상세
    @Transactional(readOnly = true)
    public BoardDTO getRead(Long bno) {
        Board board = boardRepository.findBoardWithWriter(bno).orElseThrow();

        return toDto(board);
    }

    // 작성자 join 게시판 리스트
    // 조회(GET)
    @Transactional(readOnly = true)
    public List<BoardDTO> getList() {
        List<Board> boards = boardRepository.findAllWithWriter();

        return boards.stream()
                .map(this::toDto)
                .toList();
    }

    // 생성 (POST)
    @Transactional
    public Long create(BoardCreateRequest req) {
        Users writer = usersRepository.findById(1L).orElseThrow();

        BoardType boardType = req.getBoardType() != null ? req.getBoardType() : BoardType.FREE;

        Board board = Board.builder()
                .boardType(boardType)
                .title(req.getTitle())
                .content(req.getContent())
                .userId(writer)
                .build();

        return boardRepository.save(board).getBno();
    }

    // 수정 (PUT)
    @Transactional
    public void modify(Long bno, BoardUpdateRequest req) {
        Board board = boardRepository.findById(bno).orElseThrow();

        board.changeTitle(req.getTitle());
        board.changeContent(req.getContent());
        // Dirty Checking으로 자동 modify
    }

    // 삭제 (DELETE)
    @Transactional
    public void delete(Long bno) {
        if (!boardRepository.existsById(bno)) {
            throw new NoSuchElementException("Board not found: " + bno);
        }
        boardRepository.deleteById(bno);
    }
}
