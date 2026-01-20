package com.soldesk.moa.repository.board;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.dto.BoardDTO;
import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.repository.BoardRepository;
import com.soldesk.moa.board.service.BoardService;
import com.soldesk.moa.users.repository.UsersRepository;

@Disabled
@SpringBootTest
public class BoardServiceTest {

    @Autowired
    private BoardService boardService;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Transactional(readOnly = true)
    @Test
    public void getRead() {
        Board board = boardRepository.findBoardWithWriter(1L).orElseThrow();

        String writerName = board.getUserId().getNickname();

        BoardDTO dto = BoardDTO.builder()
                .bno(board.getBno())
                .title(board.getTitle())
                .content(board.getContent())
                .writer(writerName)
                .viewCount(board.getViewCount())
                .createDate(board.getCreateDate())
                .build();

        System.out.println(dto);
    }
}
