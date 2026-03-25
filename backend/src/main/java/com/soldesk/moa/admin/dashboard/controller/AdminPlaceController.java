package com.soldesk.moa.admin.dashboard.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.soldesk.moa.admin.dashboard.dto.placeInfo.AdminPlaceDetailDTO;
import com.soldesk.moa.admin.dashboard.dto.placeInfo.AdminPlaceResponseDTO;
import com.soldesk.moa.admin.dashboard.dto.placeInfo.AdminPlaceSearchDTO;
import com.soldesk.moa.admin.dashboard.service.AdminService;
import com.soldesk.moa.common.dto.PageResultDTO;
import com.soldesk.moa.place.dto.PlaceCreateDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/places")
@Tag(name = "Admin place section", description = "Response MOA API")
@Log4j2
public class AdminPlaceController {

    private final AdminService adminService;

    @GetMapping("/list")
    @Operation(summary = "장소 목록 조회 (검색/필터/정렬)")
    public ResponseEntity<PageResultDTO<AdminPlaceResponseDTO>> getAdminPlaces(
            @ModelAttribute AdminPlaceSearchDTO searchDTO) {
        log.info("장소 목록 조회 요청: {}", searchDTO);
        return ResponseEntity.ok(adminService.getAdminPlaces(searchDTO));
    }

    @GetMapping("/{id}")
    @Operation(summary = "장소 단건 조회 (수정 페이지용)")
    public ResponseEntity<AdminPlaceDetailDTO> getAdminPlace(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getAdminPlace(id));
    }

    @PostMapping("/register")
    @Operation(summary = "장소 등록(관리자)")
    public Long postRegister(@RequestBody PlaceCreateDTO dto) {
        return adminService.createPlace(dto);
    }

    @PutMapping("/{id}")
    @Operation(summary = "장소 정보 수정(관리자)")
    public Long putPlaceInfo(@PathVariable Long id, @RequestBody PlaceCreateDTO dto) {
        return adminService.updatePlace(id, dto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "장소 정보 삭제(관리자)")
    public void deletePlace(@PathVariable Long id) {
        adminService.deletePlace(id);
    }

    // ── 특정 휴무일 관리 ──

    @GetMapping("/{id}/closed-days")
    @Operation(summary = "특정 휴무일 목록 조회")
    public ResponseEntity<List<AdminPlaceDetailDTO.ClosedDayDTO>> getClosedDays(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getPlaceClosedDays(id));
    }

    @PostMapping("/{id}/closed-days")
    @Operation(summary = "특정 휴무일 추가")
    public ResponseEntity<AdminPlaceDetailDTO.ClosedDayDTO> addClosedDay(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestBody ClosedDayRequest req) {
        return ResponseEntity.ok(adminService.addPlaceClosedDay(id, req.date(), req.reason()));
    }

    @DeleteMapping("/{id}/closed-days/{closedDayId}")
    @Operation(summary = "특정 휴무일 삭제")
    public void removeClosedDay(@PathVariable Long id, @PathVariable Long closedDayId) {
        adminService.removePlaceClosedDay(id, closedDayId);
    }

    public record ClosedDayRequest(String date, String reason) {}

}
