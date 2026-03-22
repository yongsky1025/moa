package com.soldesk.moa.common.repository;

import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.post.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImageRepository extends JpaRepository<Image, Long> {
    void deleteByPost(Post post);
}
