package com.soldesk.moa.reply.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.soldesk.moa.reply.entity.ReplyReaction;

public interface ReplyReactionRepository extends JpaRepository<ReplyReaction, Long> {
    Optional<ReplyReaction> findByReply_ReplyIdAndUser_UserId(Long replyId, Long userId);

    List<ReplyReaction> findByUser_UserIdAndReply_ReplyIdIn(Long userId, List<Long> replyIds);

    @Modifying
    @Query("""
            delete from ReplyReaction rr
            where rr.reply.deleted = true
              and rr.reply.updateDate < :cutoff
            """)
    int deleteBySoftDeletedReplyBefore(@Param("cutoff") java.time.LocalDateTime cutoff);
}
