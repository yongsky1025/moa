package com.soldesk.moa.board.cleanup;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.soldesk.moa.board.post.service.PostImageService;
import com.soldesk.moa.board.post.service.PostImageService.CleanupResult;
import com.soldesk.moa.image.cleanup.ImageTempCleanUpScheduler;

@ExtendWith(MockitoExtension.class)
class ImageTempCleanUpSchedulerTest {

    @Mock
    private PostImageService postImageService;

    @InjectMocks
    private ImageTempCleanUpScheduler imageTempCleanUpScheduler;

    @Test
    void schedulerCallsCleanupServiceOnce() {
        when(postImageService.cleanUpOrphanTempImages())
                .thenReturn(new CleanupResult(LocalDateTime.now(), 0, 0, 0, 0));

        imageTempCleanUpScheduler.cleanUpOrphanTempImages();

        verify(postImageService, times(1)).cleanUpOrphanTempImages();
    }
}
