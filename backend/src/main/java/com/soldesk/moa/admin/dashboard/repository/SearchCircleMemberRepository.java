package com.soldesk.moa.admin.dashboard.repository;

import java.util.List;

public interface SearchCircleMemberRepository {

    // 연령대 별 모임 유지율
    List<Object[]> getAgeCategoryRetention();
}
