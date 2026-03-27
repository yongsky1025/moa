package com.soldesk.moa.post.search;

import com.soldesk.moa.board.entity.constant.BoardType;
import com.soldesk.moa.common.search.dto.SearchPage;
import com.soldesk.moa.post.dto.PostSearchHitDTO;
import com.soldesk.moa.post.dto.PostSearchTarget;

public interface PostSearchExecutor {

    PostSearchEngineType type();

    SearchPage<PostSearchHitDTO> search(
            String keyword,
            PostSearchTarget target,
            BoardType boardType,
            Long circleId,
            int page,
            int size,
            String filter);
}

