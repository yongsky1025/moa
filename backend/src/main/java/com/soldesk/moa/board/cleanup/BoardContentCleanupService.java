package com.soldesk.moa.board.cleanup;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.board.entity.Board;
import com.soldesk.moa.board.board.repository.BoardRepository;
import com.soldesk.moa.board.post.entity.Post;
import com.soldesk.moa.board.post.entity.PostImage;
import com.soldesk.moa.board.post.repository.PostImageRepository;
import com.soldesk.moa.board.post.repository.PostRepository;
import com.soldesk.moa.board.reply.repository.ReplyRepository;
import com.soldesk.moa.image.repository.ImageRepository;
import com.soldesk.moa.image.service.ImageStorageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Log4j2
@Service
@RequiredArgsConstructor
@Transactional
public class BoardContentCleanupService {

    private static final long RETENTION_DAYS = 30L;

    private final ReplyRepository replyRepository;
    private final PostRepository postRepository;
    private final BoardRepository boardRepository;
    private final PostImageRepository postImageRepository;
    private final ImageRepository imageRepository;
    private final ImageStorageService imageStorageService;

    public CleanupResult cleanupSoftDeletedContents() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(RETENTION_DAYS);

        List<Post> postCandidates = postRepository.findByDeletedTrueAndDeletedAtBefore(cutoff);
        List<Board> boardCandidates = boardRepository.findByDeletedTrueAndDeletedAtBefore(cutoff);

        long deletedReplies = replyRepository.deleteByDeletedTrueAndDeletedAtBefore(cutoff);

        int deletedPosts = 0;
        int failedPosts = 0;
        int failedImages = 0;

        for (Post post : postCandidates) {
            try {
                failedImages += cleanupPost(post);
                deletedPosts++;
            } catch (Exception e) {
                failedPosts++;
                log.warn("post cleanup failed. postId={}", post.getPostId(), e);
            }
        }

        int deletedBoards = 0;
        int skippedBoards = 0;
        for (Board board : boardCandidates) {
            if (postRepository.countByBoardId_BoardId(board.getBoardId()) > 0) {
                skippedBoards++;
                continue;
            }
            boardRepository.delete(board);
            deletedBoards++;
        }

        return new CleanupResult(
                cutoff,
                deletedReplies,
                postCandidates.size(),
                deletedPosts,
                failedPosts,
                boardCandidates.size(),
                deletedBoards,
                skippedBoards,
                failedImages);
    }

    private int cleanupPost(Post post) {
        List<PostImage> mappings = postImageRepository.findByPost_PostIdOrderBySortOrderAscPostImageIdAsc(post.getPostId());

        replyRepository.deleteByPostId_PostId(post.getPostId());
        postRepository.delete(post);

        int failedImages = 0;
        for (PostImage mapping : mappings) {
            try {
                Long imageId = mapping.getImage().getImageId();
                if (postImageRepository.existsByImage_ImageId(imageId)) {
                    continue;
                }
                imageStorageService.deletePostImage(mapping.getImage().getPath());
                imageRepository.deleteById(imageId);
            } catch (Exception e) {
                failedImages++;
                log.warn("post image cleanup failed. postId={}, imageId={}", post.getPostId(),
                        mapping.getImage().getImageId(), e);
            }
        }

        return failedImages;
    }

    public record CleanupResult(
            LocalDateTime cutoff,
            long deletedReplies,
            int postCandidates,
            int deletedPosts,
            int failedPosts,
            int boardCandidates,
            int deletedBoards,
            int skippedBoards,
            int failedImages) {
    }
}
