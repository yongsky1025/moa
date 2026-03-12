package com.soldesk.moa.chat.controller;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * 채팅 페이지 렌더링 컨트롤러.
 * URL 예: /chat/room/5
 *
 * myId, myName은 JWT 토큰에서 추출한 AuthUserDTO를 통해 자동 주입.
 * (URL 파라미터로 다른 유저 위장 불가)
 */
@Controller
@RequestMapping("/chat")
public class ChatViewController {

    @GetMapping("/room/{roomId}")
    public String chatRoom(
            @PathVariable Long roomId,
            @AuthenticationPrincipal AuthUserDTO auth,
            Model model
    ) {
        model.addAttribute("roomId", roomId);
        model.addAttribute("myId", auth.getUserId());
        model.addAttribute("myName", auth.getNickname());
        return "chat/room";
    }
}
