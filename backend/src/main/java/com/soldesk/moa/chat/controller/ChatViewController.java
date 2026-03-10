package com.soldesk.moa.chat.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * 채팅 페이지 렌더링 컨트롤러.
 * URL 예: /chat/room/5?myId=1&myName=홍길동
 *
 * 인증 연동 후 myId/myName은 Principal에서 꺼내 자동 주입 예정.
 */
@Controller
@RequestMapping("/chat")
public class ChatViewController {

    @GetMapping("/room/{roomId}")
    public String chatRoom(
            @PathVariable Long roomId,
            @RequestParam Long myId,
            @RequestParam(defaultValue = "나") String myName,
            Model model
    ) {
        model.addAttribute("roomId", roomId);
        model.addAttribute("myId", myId);
        model.addAttribute("myName", myName);
        return "chat/room";
    }
}
