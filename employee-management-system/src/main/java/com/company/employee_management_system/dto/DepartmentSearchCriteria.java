package com.company.employee_management_system.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentSearchCriteria {

    private String code;
    private String name;
    private String description;
    private Boolean isActive;

    @Builder.Default
    private int page = 0;

    @Builder.Default
    private int size = 10;

    @Builder.Default
    private String sortBy = "name";

    @Builder.Default
    private String sortDirection = "ASC";
}
