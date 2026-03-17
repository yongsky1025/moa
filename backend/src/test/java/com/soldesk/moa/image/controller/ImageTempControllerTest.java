package com.soldesk.moa.image.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockMultipartFile;

import com.soldesk.moa.auth.dto.AuthUserDTO;
import com.soldesk.moa.image.dto.ImageTempUploadResponseDTO;
import com.soldesk.moa.image.service.ImageService;
import com.soldesk.moa.users.entity.Users;
import com.soldesk.moa.users.entity.constant.UserRole;
import com.soldesk.moa.users.entity.constant.UserStatus;

class ImageTempControllerTest {

    private ImageService imageService;
    private ImageTempController controller;

    @BeforeEach
    void setUp() {
        imageService = Mockito.mock(ImageService.class);
        controller = new ImageTempController(imageService);
    }

    @Test
    void uploadTempDelegatesToImageService() {
        when(imageService.uploadTempImage(eq(10L), any(), eq("temp-1"), eq(1L)))
                .thenReturn(ImageTempUploadResponseDTO.builder()
                        .imageId(100L)
                        .tempKey("temp-1")
                        .imageUrl("/images/posts/2026/03/17/a.png")
                        .ord(1L)
                        .build());

        AuthUserDTO auth = authUser(10L);
        MockMultipartFile file = new MockMultipartFile("file", "a.png", "image/png", "abc".getBytes());

        ImageTempUploadResponseDTO result = controller.uploadTemp(auth, file, "temp-1", 1L);

        assertEquals(100L, result.getImageId());
        verify(imageService).uploadTempImage(10L, file, "temp-1", 1L);
    }

    @Test
    void listTempDelegatesToImageService() {
        when(imageService.listTempImages(10L, "temp-1"))
                .thenReturn(List.of(ImageTempUploadResponseDTO.builder()
                        .imageId(100L)
                        .tempKey("temp-1")
                        .imageUrl("/images/posts/2026/03/17/a.png")
                        .ord(0L)
                        .build()));

        AuthUserDTO auth = authUser(10L);

        List<ImageTempUploadResponseDTO> result = controller.listTemp(auth, "temp-1");

        assertEquals(1, result.size());
        verify(imageService).listTempImages(10L, "temp-1");
    }

    @Test
    void deleteTempDelegatesToImageService() {
        AuthUserDTO auth = authUser(10L);

        controller.deleteTemp(auth, 100L, "temp-1");

        verify(imageService).deleteTempImage(10L, 100L, "temp-1");
    }

    private AuthUserDTO authUser(Long userId) {
        Users user = Users.builder()
                .userId(userId)
                .email("tester@example.com")
                .password("")
                .nickname("tester")
                .publicId("public-" + userId)
                .userRole(UserRole.USER)
                .userStatus(UserStatus.ACTIVE)
                .build();
        return new AuthUserDTO(user);
    }
}
