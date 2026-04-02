package com.soldesk.moa.post.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.common.search.dto.SearchPage;
import com.soldesk.moa.post.dto.CommunitySidebarPostDTO;
import com.soldesk.moa.post.dto.CommunityMyReplyDTO;
import com.soldesk.moa.post.dto.PostSearchHitDTO;
import com.soldesk.moa.post.dto.PostSearchRequestDTO;
import com.soldesk.moa.post.dto.PostBookmarkSummaryDTO;
import com.soldesk.moa.post.dto.PostReactionSummaryDTO;
import com.soldesk.moa.post.dto.PostResponseDTO;
import com.soldesk.moa.post.dto.PostSearchTarget;
import com.soldesk.moa.post.service.PostSearchService;
import com.soldesk.moa.post.service.PostService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostViewController {
    private final PostService postService;
    private final PostSearchService postSearchService;

    @PostMapping("/{postId}/view")
    public ResponseEntity<Void> increase(@PathVariable("postId") Long postId, HttpServletRequest request) {
        postService.increaseViewCountOnce(postId, PostClientIpResolver.resolve(request));
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{postId}/reactions/like")
    public PostReactionSummaryDTO react(@PathVariable("postId") Long postId,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return postService.reactToPost(postId, auth.getUserId());
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{postId}/bookmarks")
    public PostBookmarkSummaryDTO bookmarkSummary(@PathVariable("postId") Long postId,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return postService.getBookmarkSummary(postId, auth.getUserId());
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{postId}/bookmarks")
    public PostBookmarkSummaryDTO toggleBookmark(@PathVariable("postId") Long postId,
            @AuthenticationPrincipal AuthUserDTO auth) {
        return postService.toggleBookmark(postId, auth.getUserId());
    }

    @GetMapping("/search")
    public SearchPage<PostSearchHitDTO> search(@ModelAttribute PostSearchRequestDTO request,
            @AuthenticationPrincipal AuthUserDTO auth) {
        Long userId = auth == null ? null : auth.getUserId();
        return postSearchService.search(request, userId);
    }

    @GetMapping("/community")
    public List<PostResponseDTO> communityList(
            @RequestParam(value = "board", required = false, defaultValue = "all") String board,
            @RequestParam(value = "boardId", required = false) Long boardId) {
        String normalized = board == null ? "all" : board.trim().toLowerCase();
        BoardType boardType = switch (normalized) {
            case "notice" -> BoardType.NOTICE;
            case "free" -> BoardType.FREE;
            default -> null;
        };
        return postService.listCommunity(boardType, boardId);
    }

    @GetMapping("/community/page")
    public SearchPage<PostResponseDTO> communityPagedList(
            @RequestParam(value = "board", required = false, defaultValue = "all") String board,
            @RequestParam(value = "boardId", required = false) Long boardId,
            @RequestParam(value = "page", required = false, defaultValue = "1") Integer page,
            @RequestParam(value = "size", required = false, defaultValue = "20") Integer size) {
        String normalized = board == null ? "all" : board.trim().toLowerCase();
        BoardType boardType = switch (normalized) {
            case "notice" -> BoardType.NOTICE;
            case "free" -> BoardType.FREE;
            default -> null;
        };
        return postService.listCommunityPaged(boardType, boardId, page, size);
    }

    @GetMapping("/community/sidebar")
    public List<CommunitySidebarPostDTO> communitySidebar(
            @RequestParam(value = "board", required = false, defaultValue = "all") String board,
            @RequestParam(value = "boardId", required = false) Long boardId,
            @RequestParam(value = "sort", required = false, defaultValue = "recent") String sort,
            @RequestParam(value = "limit", required = false, defaultValue = "12") Integer limit) {
        String normalized = board == null ? "all" : board.trim().toLowerCase();
        BoardType boardType = switch (normalized) {
            case "notice" -> BoardType.NOTICE;
            case "free" -> BoardType.FREE;
            default -> null;
        };
        return postService.listCommunitySidebar(boardType, boardId, sort, limit);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/community/bookmarks")
    public List<PostResponseDTO> myBookmarkedCommunityList(
            @RequestParam(value = "board", required = false, defaultValue = "all") String board,
            @RequestParam(value = "boardId", required = false) Long boardId,
            @RequestParam(value = "q", required = false) String keyword,
            @RequestParam(value = "target", required = false, defaultValue = "ALL") String target,
            @AuthenticationPrincipal AuthUserDTO auth) {
        String normalized = board == null ? "all" : board.trim().toLowerCase();
        BoardType boardType = switch (normalized) {
            case "notice" -> BoardType.NOTICE;
            case "free" -> BoardType.FREE;
            default -> null;
        };
        return postService.listMyBookmarkedCommunity(auth.getUserId(), boardType, boardId, keyword, parseTarget(target));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/community/my-posts")
    public List<PostResponseDTO> myCommunityPosts(
            @RequestParam(value = "board", required = false, defaultValue = "all") String board,
            @RequestParam(value = "boardId", required = false) Long boardId,
            @RequestParam(value = "q", required = false) String keyword,
            @RequestParam(value = "target", required = false, defaultValue = "ALL") String target,
            @AuthenticationPrincipal AuthUserDTO auth) {
        String normalized = board == null ? "all" : board.trim().toLowerCase();
        BoardType boardType = switch (normalized) {
            case "notice" -> BoardType.NOTICE;
            case "free" -> BoardType.FREE;
            default -> null;
        };
        return postService.listMyCommunityPosts(auth.getUserId(), boardType, boardId, keyword, parseTarget(target));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/community/my-replies")
    public List<CommunityMyReplyDTO> myCommunityRepliedPosts(
            @RequestParam(value = "board", required = false, defaultValue = "all") String board,
            @RequestParam(value = "boardId", required = false) Long boardId,
            @RequestParam(value = "q", required = false) String keyword,
            @RequestParam(value = "target", required = false, defaultValue = "ALL") String target,
            @AuthenticationPrincipal AuthUserDTO auth) {
        String normalized = board == null ? "all" : board.trim().toLowerCase();
        BoardType boardType = switch (normalized) {
            case "notice" -> BoardType.NOTICE;
            case "free" -> BoardType.FREE;
            default -> null;
        };
        return postService.listMyCommunityReplies(auth.getUserId(), boardType, boardId, keyword, parseTarget(target));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/search/reindex")
    public Map<String, Object> reindex(@RequestParam(value = "batchSize", required = false) Integer batchSize) {
        long indexedCount = postSearchService.reindexAll(batchSize);
        return Map.of(
                "indexedCount", indexedCount,
                "batchSize", batchSize == null ? 500 : Math.min(Math.max(batchSize, 1), 2000));
    }

    private PostSearchTarget parseTarget(String target) {
        if (target == null || target.isBlank()) {
            return PostSearchTarget.ALL;
        }
        try {
            return PostSearchTarget.valueOf(target.trim().toUpperCase());
        } catch (IllegalArgumentException ignored) {
            return PostSearchTarget.ALL;
        }
    }
}
