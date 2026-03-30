package com.soldesk.moa.admin.report.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.soldesk.moa.common.entity.Image;
import com.soldesk.moa.common.entity.constant.ImageDomain;

public interface ReportImageRepository extends JpaRepository<Image, Long> {

    /** 신고에 첨부된 이미지 목록 조회 */
    List<Image> findByDomainAndOwnerIdAndDeletedFalse(ImageDomain domain, Long reportId);
}
