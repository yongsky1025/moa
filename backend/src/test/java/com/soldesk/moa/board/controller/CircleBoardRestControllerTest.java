package com.soldesk.moa.board.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.soldesk.moa.board.board.controller.CircleBoardRestController;
import com.soldesk.moa.board.board.dto.BoardResponseDTO;
import com.soldesk.moa.board.board.entity.constant.BoardType;
import com.soldesk.moa.board.board.service.BoardService;

class CircleBoardRestControllerTest {

    private BoardService boardService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        boardService = Mockito.mock(BoardService.class);
        CircleBoardRestController controller = new CircleBoardRestController(boardService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void readReturnsCircleScopedBoard() throws Exception {
        when(boardService.readCircleBoard(7L, 12L))
                .thenReturn(BoardResponseDTO.builder()
                        .boardId(12L)
                        .boardType(BoardType.CIRCLE)
                        .name("스터디")
                        .circleId(7L)
                        .build());

        mockMvc.perform(get("/api/circle/7/boards/12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.boardId").value(12L))
                .andExpect(jsonPath("$.boardType").value("CIRCLE"))
                .andExpect(jsonPath("$.circleId").value(7L));

        verify(boardService).readCircleBoard(7L, 12L);
    }
}
