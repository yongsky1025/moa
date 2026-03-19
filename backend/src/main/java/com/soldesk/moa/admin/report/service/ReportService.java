package com.soldesk.moa.admin.report.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.soldesk.moa.admin.dashboard.repository.AdminUsersRepository;
import com.soldesk.moa.admin.report.dto.ReportFilterDTO;
import com.soldesk.moa.admin.report.dto.ReportRequestDTO;
import com.soldesk.moa.admin.report.dto.ReportResponseDTO;
import com.soldesk.moa.admin.report.entity.Report;
import com.soldesk.moa.admin.report.entity.constant.ReportStatus;
import com.soldesk.moa.admin.report.repository.ReportRepository;
import com.soldesk.moa.common.dto.PageResultDTO;
import com.soldesk.moa.users.entity.Users;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@Service
@RequiredArgsConstructor
@Transactional
@Log4j2
public class ReportService {

    private final ReportRepository reportRepository;
    private final AdminUsersRepository adminUsersRepository;

    // 신고접수
    public void submitReport(Long reporterId, ReportRequestDTO dto) {
        Users reporter = adminUsersRepository.findById(reporterId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));

        // 중복 신고인지 체크
        boolean isDuplicate = reportRepository.existsByReporter_UserIdAndTargetTypeAndTargetId(reporterId,
                dto.targetType(), dto.targetId());
        if (isDuplicate) {
            throw new IllegalStateException("이미 신고한 대상입니다.");
        }

        reportRepository.save(Report.builder()
                .reporter(reporter)
                .targetType(dto.targetType())
                .targetId(dto.targetId())
                .category(dto.category())
                .description(dto.description())
                .build());
    }

    // 신고리스트
    @Transactional(readOnly = true)
    public PageResultDTO<ReportResponseDTO> getReports(ReportFilterDTO filterDTO) {

        Pageable pageable = PageRequest.of(filterDTO.getPage() - 1, filterDTO.getSize());
        Page<Report> reportPage = reportRepository.searchReports(filterDTO, pageable);

        // entity -> dto
        List<ReportResponseDTO> dtoList = reportPage.getContent()
                .stream().map(this::entityToDto).collect(Collectors.toList());

        return PageResultDTO.<ReportResponseDTO>withAll()
                .dtoList(dtoList)
                .pageRequestDTO(filterDTO)
                .totalCount(reportPage.getTotalElements())
                .build();
    }

    // 신고 상세 조회
    public ReportResponseDTO getOneReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 신고입니다."));

        // 신고 조회 순간 status 검토중으로 변경
        if (report.getStatus() == ReportStatus.PENDING) {
            report.setStatus(ReportStatus.REVIEWING);
        }

        return entityToDto(report);
    }

    // 신고 상태 변경(status 변경, adminNote추가)
    public void updateReportStatus(Long reportId, ReportStatus status, String adminNote) {
        if (adminNote == null || adminNote.isBlank()) {
            throw new IllegalArgumentException("관리자 메모는 필수 입력 항목입니다.");
        }
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 신고입니다."));
        report.setStatus(status);
        report.setAdminNote(adminNote.trim());
    }

    // entity -> dto 변환 전용메소드
    private ReportResponseDTO entityToDto(Report report) {
        return ReportResponseDTO.builder()
                .reportId(report.getId())
                .reporterName(report.getReporter().getName())
                .targetType(report.getTargetType())
                .targetId(report.getTargetId())
                .category(report.getCategory())
                .status(report.getStatus())
                .adminNote(report.getAdminNote())
                .createdAt(report.getCreateDate())
                .build();
    }

}
