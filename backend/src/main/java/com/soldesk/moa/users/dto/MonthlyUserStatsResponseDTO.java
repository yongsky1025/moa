package com.soldesk.moa.users.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MonthlyUserStatsResponseDTO {

    private final List<String> labels;
    private final List<Long> newUsers;
    private final List<Long> withdrawnUsers;
}
