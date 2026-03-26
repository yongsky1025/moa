package com.soldesk.moa.post.search;

import java.util.List;

import org.springframework.stereotype.Component;

import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.common.search.dto.SearchPage;
import com.soldesk.moa.common.search.dto.SearchQuery;
import com.soldesk.moa.post.dto.PostSearchHitDTO;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class MeiliPostSearchExecutor implements PostSearchExecutor {

    private final PostDomainSearchSupport postDomainSearchSupport;

    @Override
    public PostSearchEngineType type() {
        return PostSearchEngineType.MEILI;
    }

    @Override
    public SearchPage<PostSearchHitDTO> search(
            String keyword,
            BoardType boardType,
            Long circleId,
            int page,
            int size,
            String filter) {
        postDomainSearchSupport.ensureConfigured();

        SearchQuery query = SearchQuery.builder()
                .q(keyword)
                .page(page)
                .size(size)
                .filter(filter)
                .sort(List.of("createDate:desc"))
                .attributesToRetrieve(List.of(
                        "id",
                        "postId",
                        "boardId",
                        "boardType",
                        "circleId",
                        "title",
                        "content",
                        "authorName",
                        "authorPublicId",
                        "viewCount",
                        "likeCount",
                        "replyCount",
                        "createDate",
                        "updateDate"))
                .build();

        return postDomainSearchSupport.searchPosts(query);
    }
}

