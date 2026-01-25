package com.soldesk.moa.repository.board;

import java.util.stream.IntStream;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.User;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.repository.BoardRepository;
import com.soldesk.moa.board.repository.PostRepository;
import com.soldesk.moa.users.dto.UserDTO;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.repository.UsersRepository;

@Disabled
@SpringBootTest
public class BoardRepositoryTest {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Test
    public void testInserBoard() {
        IntStream.rangeClosed(1, 3).forEach(i -> {
            Board board = Board.builder()
                    .boardType(BoardType.NOTICE)
                    .name("게시판" + i)
                    .circleId(null)
                    .build();
            boardRepository.save(board);
        });
        IntStream.rangeClosed(4, 10).forEach(i -> {
            Board board = Board.builder()
                    .boardType(BoardType.CIRCLE)
                    .name("게시판" + i)
                    .circleId(null)
                    .build();
            boardRepository.save(board);
        });
    }

    @Test
    public void testInserPost() {

        IntStream.rangeClosed(1, 10).forEach(i -> {
            for (int j = 1; j < 11; j++) {

                Post post = Post.builder()
                        .title("게시글" + j)
                        .content("게시글 내용" + j)
                        .viewCount(0)
                        .userId(Users.builder().userId((long) j).build())
                        .boardId(Board.builder().boardId((long) i).build())
                        .build();
                postRepository.save(post);
            }
        });
    }
}
