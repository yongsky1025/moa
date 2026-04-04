package com.soldesk.moa.admin.dashboard.dto.maindashboard;

// 예약수 (증감률 포함)
public record ReservationCountDTO(
                long todayCount,
                long yesterdayCount,
                double todayChangeRate, // (today - yesterday) / yesterday * 100
                long weekCount,
                long lastWeekCount,
                double weekChangeRate) {

}
