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

import com.soldesk.moa.board.cleanup.BoardContentCleanupService.CleanupResult;

@ExtendWith(MockitoExtension.class)
class BoardContentCleanupSchedulerTest {

    @Mock
    private BoardContentCleanupService cleanupService;

    @InjectMocks
    private BoardContentCleanupScheduler scheduler;

    @Test
    void schedulerCallsCleanupServiceOnce() {
        when(cleanupService.cleanupSoftDeletedContents())
                .thenReturn(new CleanupResult(LocalDateTime.now(), 0L, 0, 0, 0, 0, 0, 0, 0));

        scheduler.cleanupSoftDeletedContents();

        verify(cleanupService, times(1)).cleanupSoftDeletedContents();
    }
}
