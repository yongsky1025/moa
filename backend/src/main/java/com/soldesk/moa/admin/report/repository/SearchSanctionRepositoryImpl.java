package com.soldesk.moa.admin.report.repository;

import org.springframework.data.jpa.repository.support.QuerydslRepositorySupport;

import com.soldesk.moa.admin.report.entity.Sanction;

public class SearchSanctionRepositoryImpl extends QuerydslRepositorySupport implements SearchSanctionRepository {

    public SearchSanctionRepositoryImpl(Class<?> domainClass) {
        super(Sanction.class);
    }

}
