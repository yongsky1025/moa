package com.soldesk.moa.admin.dashboard.dto;

import java.time.LocalDate;

import lombok.Builder;

@Builder
public record DailyCountDTO(
        LocalDate date,
        Long count) {

}
