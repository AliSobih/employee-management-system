package com.company.employee_management_system.service;


import com.company.employee_management_system.dto.DepartmentDTO;
import com.company.employee_management_system.dto.DepartmentSearchCriteria;
import org.springframework.data.domain.Page;

import java.util.List;

public interface DepartmentService {

    DepartmentDTO createDepartment(DepartmentDTO departmentDTO);
    DepartmentDTO updateDepartment(Long id, DepartmentDTO departmentDTO);
    List<DepartmentDTO> getAllDepartments();
    List<DepartmentDTO> getAllActiveDepartments();
    Page<DepartmentDTO> searchDepartments(DepartmentSearchCriteria criteria);
    void deleteDepartment(Long id);
    void restoreDepartment(Long id);
    boolean existsByCode(String code);
    boolean existsByName(String name);
}