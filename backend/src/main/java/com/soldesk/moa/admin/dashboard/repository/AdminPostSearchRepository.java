package com.soldesk.moa.admin.dashboard.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.querydsl.core.Tuple;
import com.soldesk.moa.admin.dashboard.dto.postInfo.AdminPostSearchDTO;

public interface AdminPostSearchRepository {

    // 게시글 관리 - 필터/검색/정렬 목록 조회
    Page<Tuple> searchAdminPosts(AdminPostSearchDTO searchDTO, Pageable pageable);
}
