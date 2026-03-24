package com.soldesk.moa.post.entity;

import com.soldesk.moa.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "post_view_log", uniqueConstraints = {
        @UniqueConstraint(name = "uk_post_view_log_post_ip", columnNames = { "post_id", "viewer_ip" })
})
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostViewLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long postViewLogId;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "viewer_ip", nullable = false, length = 45)
    private String viewerIp;
}
