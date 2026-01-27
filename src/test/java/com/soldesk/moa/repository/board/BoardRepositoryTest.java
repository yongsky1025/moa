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
import com.soldesk.moa.circle.entity.Circle;
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
            BoardType type = switch (i) {
                case 1 -> BoardType.NOTICE;
                case 2 -> BoardType.FREE;
                case 3 -> BoardType.SUPPORT;
                default -> BoardType.CIRCLE;
            };

            Board board = Board.builder()
                    .boardType(type)
                    .name("게시판" + i)
                    .circleId(null)
                    .build();
            boardRepository.save(board);
        });
        IntStream.rangeClosed(1, 17).forEach(i -> {
            long boardNo = i + 3;
            Board board = Board.builder()
                    .boardType(BoardType.CIRCLE)
                    .name("게시판" + boardNo)
                    .circleId(Circle.builder().circleId((long) i).build())
                    .build();
            boardRepository.save(board);

        });
    }

    @Test
    public void testInserPost() {

        IntStream.rangeClosed(1, 20).forEach(i -> {
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
