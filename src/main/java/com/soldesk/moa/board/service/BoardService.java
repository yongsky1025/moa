package com.soldesk.moa.board.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.board.dto.BoardCreateRequest;
import com.soldesk.moa.board.dto.PostDTO;
import com.soldesk.moa.board.dto.BoardUpdateRequest;
import com.soldesk.moa.board.entity.Post;
import com.soldesk.moa.board.entity.constant.BoardRole;
import com.soldesk.moa.board.repository.BoardRepository;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.repository.UsersRepository;

import jakarta.persistence.EnumType;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@Log4j2
@RequiredArgsConstructor
public class BoardService {

    private final UsersRepository usersRepository;

    private final BoardRepository boardRepository;

    private PostDTO toDto(Post board) {

        String writerName = board.getUserId().getNickname();

        // post 기본dto 틀
        return PostDTO.builder()
                .postId(board.getPostId())
                .title(board.getTitle())
                .content(board.getContent())
                .writer(writerName)
                .viewCount(board.getViewCount())
                .createDate(board.getCreateDate())
                .build();
    }
}
