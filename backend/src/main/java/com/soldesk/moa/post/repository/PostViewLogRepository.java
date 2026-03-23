package com.soldesk.moa.post.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.post.entity.PostViewLog;

public interface PostViewLogRepository extends JpaRepository<PostViewLog, Long> {

    @Modifying
    @Query(value = """
            insert ignore into post_view_log (post_id, viewer_ip, create_date, update_date)
            values (:postId, :viewerIp, now(), now())
            """, nativeQuery = true)
    int insertIgnore(@Param("postId") Long postId, @Param("viewerIp") String viewerIp);
}
