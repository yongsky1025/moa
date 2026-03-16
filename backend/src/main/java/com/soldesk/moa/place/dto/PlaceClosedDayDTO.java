package com.soldesk.moa.place.dto;

import java.time.DayOfWeek;
import java.time.LocalDate;

import lombok.Builder;

@Builder
public record PlaceClosedDayDTO(
                DayOfWeek dayOfWeek,
                LocalDate date,
                String reason,
                String closedType) {

}
