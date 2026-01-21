package com.soldesk.moa.repository.board;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.dto.PostDTO;
import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.repository.BoardRepository;
import com.soldesk.moa.board.service.BoardService;
import com.soldesk.moa.users.entity.Users;
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
        Users users = usersRepository.findById(1L).orElseThrow();
        String writerName = users.getNickname();
        Post post = boardRepository.findById(1L).orElseThrow();

        PostDTO dto = PostDTO.builder()
                .postId(post.getPostId())
                .title(post.getTitle())
                .content(post.getContent())
                .writer(writerName)
                .viewCount(post.getViewCount())
                .createDate(post.getCreateDate())
                .build();

        System.out.println(dto);
    }
}
