package com.soldesk.moa.reply.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;

import com.soldesk.moa.board.entity.Board;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.board.repository.BoardRepository;
import com.soldesk.moa.post.entity.Post;
import com.soldesk.moa.post.repository.PostRepository;
import com.soldesk.moa.reply.entity.Reply;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.AuthProvider;
import com.soldesk.moa.users.entity.constant.UserGender;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.repository.UsersRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;

import jakarta.persistence.EntityManager;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@Import(ReplyRepositoryBulkDeleteTest.QuerydslTestConfig.class)
class ReplyRepositoryBulkDeleteTest {

    @TestConfiguration
    static class QuerydslTestConfig {
        @Bean
        JPAQueryFactory jpaQueryFactory(EntityManager entityManager) {
            return new JPAQueryFactory(entityManager);
        }
    }

    @Autowired
    private ReplyRepository replyRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private BoardRepository boardRepository;

    @Autowired
    private PostRepository postRepository;

    @Test
    void unlinkParentReferences_thenDeleteAllInBatch_deletesSelfReferencedReplies() {
        Users user = usersRepository.save(Users.builder()
                .name("seed-user")
                .email("seed-user@moa.local")
                .password("pw")
                .nickname("seed-user")
                .birthDate(LocalDate.of(1995, 1, 1))
                .userRole(UserRole.USER)
                .userGender(UserGender.UNSPECIFIED)
                .provider(AuthProvider.LOCAL)
                .build());

        Board board = boardRepository.save(Board.builder()
                .boardType(BoardType.FREE)
                .name("free")
                .build());

        Post post = postRepository.save(Post.builder()
                .title("title")
                .content("content")
                .userId(user)
                .boardId(board)
                .build());

        Reply parent = replyRepository.save(Reply.builder()
                .postId(post)
                .userId(user)
                .content("parent")
                .replyToUserId(null)
                .build());

        replyRepository.save(Reply.builder()
                .postId(post)
                .userId(user)
                .content("child")
                .parentId(parent)
                .replyToUserId(parent.getUserId())
                .build());

        int unlinkedCount = replyRepository.unlinkParentReferences();
        replyRepository.deleteAllInBatch();

        assertThat(unlinkedCount).isEqualTo(1);
        assertThat(replyRepository.count()).isZero();
    }
}
