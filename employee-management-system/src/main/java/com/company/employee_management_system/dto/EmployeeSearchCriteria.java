package com.company.employee_management_system.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSearchCriteria {

    private String code;
    private String name;
    private Long departmentId;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String mobile;
    private Boolean isActive;

    @Builder.Default
    private int page = 0;

    @Builder.Default
    private int size = 10;

    @Builder.Default
    private String sortBy = "createdAt";

    @Builder.Default
    private String sortDirection = "DESC";
}
