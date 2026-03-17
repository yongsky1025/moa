package com.soldesk.moa.board.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.soldesk.moa.board.post.repository.PostImageRepository;
import com.soldesk.moa.board.post.service.PostImageService;
import com.soldesk.moa.image.entity.Image;
import com.soldesk.moa.image.repository.ImageRepository;
import com.soldesk.moa.image.service.ImageStorageService;
import com.soldesk.moa.users.repository.UsersRepository;

@ExtendWith(MockitoExtension.class)
class PostImageServiceTest {

    @Mock
    private ImageRepository imageRepository;

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private PostImageRepository postImageRepository;

    @Mock
    private ImageStorageService imageStorageService;

    @InjectMocks
    private PostImageService postImageService;

    @Test
    void cleanupDeletesOldOrphansAndSkipsLinkedImages() {
        Image orphan = image(1L, true, "/images/posts/2026/03/15/a.png");
        Image linked = image(2L, true, "/images/posts/2026/03/15/b.png");

        when(imageRepository.findByTemporaryIsTrueAndUploadedAtBefore(any(LocalDateTime.class)))
                .thenReturn(List.of(orphan, linked));
        when(postImageRepository.existsByImage_ImageId(1L)).thenReturn(false);
        when(postImageRepository.existsByImage_ImageId(2L)).thenReturn(true);

        PostImageService.CleanupResult result = postImageService.cleanUpOrphanTempImages();

        verify(imageStorageService, times(1)).deletePostImage(orphan.getPath());
        verify(imageRepository, times(1)).delete(orphan);
        verify(imageRepository, times(0)).delete(linked);
        assertEquals(2, result.candidateCount());
        assertEquals(1, result.deletedCount());
        assertEquals(0, result.failedCount());
        assertEquals(1, result.skippedCount());
    }

    @Test
    void cleanupContinuesWhenDeleteFails() {
        Image first = image(11L, true, "/images/posts/2026/03/14/first.png");
        Image second = image(12L, true, "/images/posts/2026/03/14/second.png");

        when(imageRepository.findByTemporaryIsTrueAndUploadedAtBefore(any(LocalDateTime.class)))
                .thenReturn(List.of(first, second));
        when(postImageRepository.existsByImage_ImageId(11L)).thenReturn(false);
        when(postImageRepository.existsByImage_ImageId(12L)).thenReturn(false);
        doThrow(new RuntimeException("delete failed")).when(imageRepository).delete(first);

        PostImageService.CleanupResult result = postImageService.cleanUpOrphanTempImages();

        verify(imageRepository, times(1)).delete(first);
        verify(imageRepository, times(1)).delete(second);
        assertEquals(2, result.candidateCount());
        assertEquals(1, result.deletedCount());
        assertEquals(1, result.failedCount());
        assertEquals(0, result.skippedCount());
    }

    @Test
    void cleanupUses24HourCutoff() {
        when(imageRepository.findByTemporaryIsTrueAndUploadedAtBefore(any(LocalDateTime.class)))
                .thenReturn(List.of());

        LocalDateTime before = LocalDateTime.now().minusHours(24).minusMinutes(1);
        postImageService.cleanUpOrphanTempImages();
        LocalDateTime after = LocalDateTime.now().minusHours(24).plusMinutes(1);

        ArgumentCaptor<LocalDateTime> captor = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(imageRepository).findByTemporaryIsTrueAndUploadedAtBefore(captor.capture());
        LocalDateTime cutoff = captor.getValue();

        assertTrue(cutoff.isAfter(before));
        assertTrue(cutoff.isBefore(after));
    }

    private Image image(Long id, boolean temporary, String path) {
        return Image.builder()
                .imageId(id)
                .name("img")
                .uuid("uuid-" + id)
                .path(path)
                .extension(".png")
                .mimeType("image/png")
                .fileSize(120L)
                .ord(0L)
                .user(null)
                .tempKey("temp-key")
                .temporary(temporary)
                .uploadedAt(LocalDateTime.now().minusDays(2))
                .build();
    }
}
