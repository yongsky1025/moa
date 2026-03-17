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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.soldesk.moa.board.post.controller.CirclePostRestController;
import com.soldesk.moa.board.post.dto.PostResponseDTO;
import com.soldesk.moa.board.post.dto.PostSearchPageRequestDTO;
import com.soldesk.moa.board.post.service.PostService;

class CirclePostRestControllerTest {

    private PostService postService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        postService = Mockito.mock(PostService.class);
        CirclePostRestController controller = new CirclePostRestController(postService);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void listReturnsLegacyListShape() throws Exception {
        when(postService.listCircle(3L, 7L))
                .thenReturn(List.of(PostResponseDTO.builder().postId(9L).title("legacy-circle").build()));

        mockMvc.perform(get("/api/circle/3/boards/7/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].postId").value(9L))
                .andExpect(jsonPath("$[0].title").value("legacy-circle"));

        verify(postService).listCircle(3L, 7L);
    }

    @Test
    void pagedListBindsScopeAndRequestParams() throws Exception {
        when(postService.listCirclePaged(eq(3L), eq(7L), any(PostSearchPageRequestDTO.class)))
                .thenReturn(new PageImpl<>(
                        List.of(PostResponseDTO.builder().postId(10L).title("paged-circle").build()),
                        PageRequest.of(0, 1),
                        1));

        mockMvc.perform(get("/api/circle/3/boards/7/posts/paged")
                .queryParam("page", "4")
                .queryParam("size", "8")
                .queryParam("keyword", "club"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].postId").value(10L));

        ArgumentCaptor<PostSearchPageRequestDTO> captor = ArgumentCaptor.forClass(PostSearchPageRequestDTO.class);
        verify(postService).listCirclePaged(eq(3L), eq(7L), captor.capture());
        PostSearchPageRequestDTO req = captor.getValue();
        org.junit.jupiter.api.Assertions.assertEquals(4, req.getPage());
        org.junit.jupiter.api.Assertions.assertEquals(8, req.getSize());
        org.junit.jupiter.api.Assertions.assertEquals("club", req.getKeyword());
    }
}
