package com.soldesk.moa.repository.board;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.IntStream;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.repository.BoardRepository;
import com.soldesk.moa.post.entity.Post;
import com.soldesk.moa.post.repository.PostRepository;
import com.soldesk.moa.reply.entity.Reply;
import com.soldesk.moa.reply.repository.ReplyRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

@Disabled
@SpringBootTest
public class ReplyRepositoryTest {

    @Autowired
    private ReplyRepository replyRepository;

    @Autowired
    private PostRepository postRepository;

    @Test
    public void seedRepliesForAllPosts() {
        List<Post> posts = postRepository.findAll();

        posts.forEach(post -> {
            Users author = post.getUserId();
            if (author == null) {
                return;
            }

            IntStream.rangeClosed(1, 3).forEach(i -> {
                Reply parent = Reply.builder()
                        .postId(post) // 엔티티 필드명에 맞게 확인
                        .userId(author) // 엔티티 필드명에 맞게 확인
                        .content("댓글 " + i + " (postId=" + post.getPostId() + ")")
                        .parentId(null)
                        .replyToUserId(null)
                        .build();
                parent = replyRepository.save(parent);

                int childCount = ThreadLocalRandom.current().nextInt(0, 3);
                for (int c = 1; c <= childCount; c++) {
                    Reply child = Reply.builder()
                            .postId(post)
                            .userId(author)
                            .content("대댓글 " + i + "-" + c)
                            .parentId(parent)
                            .replyToUserId(parent.getUserId())
                            .build();
                    replyRepository.save(child);
                }
            });
        });
    }
}
