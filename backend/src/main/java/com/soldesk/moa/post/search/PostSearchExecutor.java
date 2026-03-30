package com.soldesk.moa.post.search;

import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.common.search.dto.SearchPage;
import com.soldesk.moa.post.dto.PostSearchHitDTO;

public interface PostSearchExecutor {

    PostSearchEngineType type();

    SearchPage<PostSearchHitDTO> search(
            String keyword,
            BoardType boardType,
            Long circleId,
            int page,
            int size,
            String filter);
}

