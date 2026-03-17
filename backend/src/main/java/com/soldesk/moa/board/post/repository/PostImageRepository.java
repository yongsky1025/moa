package com.soldesk.moa.board.post.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.board.post.entity.PostImage;
import com.soldesk.moa.board.post.entity.constant.PostImageUsageType;

public interface PostImageRepository extends JpaRepository<PostImage, Long> {

    List<PostImage> findByPost_PostIdOrderBySortOrderAscPostImageIdAsc(Long postId);

    Optional<PostImage> findByPost_PostIdAndUsageType(Long postId, PostImageUsageType usageType);

    List<PostImage> findByPost_PostIdAndUsageTypeOrderBySortOrderAscPostImageIdAsc(Long postId, PostImageUsageType usageType);

    boolean existsByPost_PostIdAndImage_ImageId(Long postId, Long imageId);

    void deleteByPost_PostId(Long postId);

    boolean existsByImage_ImageId(Long imageId);
}
