package com.soldesk.moa.admin.temporary;

import com.soldesk.moa.users.entity.Users;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@ToString(exclude = { "user", "board" })
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long replyId;

    @Column(nullable = false)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Users user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Board board;

}
