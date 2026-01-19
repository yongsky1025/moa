package com.soldesk.moa.repository.board;

import java.util.stream.IntStream;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.repository.BoardRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.repository.UsersRepository;

@Disabled
@SpringBootTest
public class BoardRepositoryTest {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Test
    public void testInsertUser() {
        IntStream.rangeClosed(1, 20).forEach(i -> {
            Users users = Users.builder()
                    .name("name" + i)
                    .email("user" + i + "@gmail.com")
                    .nickname("user" + i)
                    .address("address" + i)
                    .userRole(UserRole.USER)
                    .build();
            usersRepository.save(users);

        });

    }

    @Test
    public void testInsertBoard() {
        IntStream.rangeClosed(1, 20).forEach(i -> {
            Board board = Board.builder()
                    .boardType(BoardType.NOTICE)
                    .title("title_test" + i)
                    .content("content_test" + i)
                    .viewCount(0)
                    .writer(Users.builder().userId((long) i).build())
                    .build();
            boardRepository.save(board);
        });
    }

    @Test
    @Transactional
    public void testBoardModify() {

        Board board = boardRepository.findById(1L).orElseThrow();

        board.changeTitle("수정title하자");
        board.changeContent("수정content하자");

        System.out.println(boardRepository.save(board));
    }

    @Test
    @Transactional
    public void testFindBoard() {

        Board board = boardRepository.findBoardWithWriter(1L).orElseThrow();

        System.out.println(board);
        System.out.println(board.getWriter().getEmail());
    }
}
