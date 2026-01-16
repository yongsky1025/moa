package com.soldesk.moa.admin.dto;

import groovy.transform.ToString;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class GenderRatioDTO {

    private Long totalCount;

    private Long maleCount;
}
