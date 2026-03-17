package com.soldesk.moa.board.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.PageImpl;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.soldesk.moa.board.post.controller.FreePostRestController;
import com.soldesk.moa.board.post.dto.PostResponseDTO;
import com.soldesk.moa.board.post.dto.PostSearchPageRequestDTO;
import com.soldesk.moa.board.board.entity.constant.BoardType;
import com.soldesk.moa.board.post.service.PostService;

class FreePostRestControllerTest {

    private PostService postService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        postService = Mockito.mock(PostService.class);
        FreePostRestController controller = new FreePostRestController(postService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void listReturnsLegacyListShape() throws Exception {
        when(postService.listGlobal(BoardType.FREE))
                .thenReturn(List.of(PostResponseDTO.builder().postId(1L).title("legacy").build()));

        mockMvc.perform(get("/api/free"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].postId").value(1L))
                .andExpect(jsonPath("$[0].title").value("legacy"));

        verify(postService).listGlobal(BoardType.FREE);
    }

    @Test
    void pagedListBindsPageParams() throws Exception {
        when(postService.listGlobalPaged(eq(BoardType.FREE), any(PostSearchPageRequestDTO.class)))
                .thenReturn(new PageImpl<>(
                        List.of(PostResponseDTO.builder().postId(2L).title("paged").build()),
                        PageRequest.of(0, 1),
                        1));

        mockMvc.perform(get("/api/free/paged")
                .queryParam("page", "2")
                .queryParam("size", "5")
                .queryParam("keyword", "hello"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].postId").value(2L))
                .andExpect(jsonPath("$.number").value(0))
                .andExpect(jsonPath("$.size").value(1));

        ArgumentCaptor<PostSearchPageRequestDTO> captor = ArgumentCaptor.forClass(PostSearchPageRequestDTO.class);
        verify(postService).listGlobalPaged(eq(BoardType.FREE), captor.capture());
        PostSearchPageRequestDTO req = captor.getValue();
        org.junit.jupiter.api.Assertions.assertEquals(2, req.getPage());
        org.junit.jupiter.api.Assertions.assertEquals(5, req.getSize());
        org.junit.jupiter.api.Assertions.assertEquals("hello", req.getKeyword());
    }
}
