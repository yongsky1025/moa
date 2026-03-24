package com.soldesk.moa.reply.entity;

import com.soldesk.moa.common.entity.BaseEntity;
import com.soldesk.moa.reply.entity.constant.ReplyReactionType;
import com.soldesk.moa.users.entity.Users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@ToString(exclude = { "reply", "user" })
@Table(name = "reply_reaction", uniqueConstraints = {
        @UniqueConstraint(name = "uk_reply_reaction_reply_user", columnNames = { "reply_id", "user_id" })
})
@Entity
public class ReplyReaction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long replyReactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_id", nullable = false)
    private Reply reply;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ReplyReactionType reactionType;
}
