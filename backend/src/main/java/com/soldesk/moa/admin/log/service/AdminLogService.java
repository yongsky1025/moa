package com.soldesk.moa.admin.log.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.soldesk.moa.admin.log.entity.AdminActionLog;
import com.soldesk.moa.admin.log.repository.AdminActionLogRepository;
import com.soldesk.moa.common.dto.PageRequestDTO;
import com.soldesk.moa.common.dto.PageResultDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminLogService {
    private final AdminActionLogRepository adminActionLogRepository;

    @Async
    public void save(AdminActionLog log) {
        adminActionLogRepository.save(log);
    }

    public PageResultDTO<AdminActionLog> getLogs(PageRequestDTO pageRequestDTO) {
        Pageable pageable = PageRequest.of(pageRequestDTO.getPage() - 1, pageRequestDTO.getSize());

        Page<AdminActionLog> result = adminActionLogRepository.findAll(pageable);

        return PageResultDTO.<AdminActionLog>withAll()
                .dtoList(result.getContent())
                .pageRequestDTO(pageRequestDTO)
                .totalCount(result.getTotalElements())
                .build();
    }

    public PageResultDTO<AdminActionLog> getLogsByActorId(Long adminId, PageRequestDTO pageRequestDTO) {
        Pageable pageable = PageRequest.of(pageRequestDTO.getPage() - 1, pageRequestDTO.getSize());

        Page<AdminActionLog> result = adminActionLogRepository.findByActorId(adminId, pageable);

        return PageResultDTO.<AdminActionLog>withAll()
                .dtoList(result.getContent())
                .pageRequestDTO(pageRequestDTO)
                .totalCount(result.getTotalElements())
                .build();
    }

}