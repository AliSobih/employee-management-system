package com.company.employee_management_system.service;

import com.company.employee_management_system.dto.EmployeeDTO;
import com.company.employee_management_system.dto.EmployeeSearchCriteria;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface EmployeeService {

    EmployeeDTO createEmployee(EmployeeDTO employeeDTO);
    EmployeeDTO updateEmployee(Long id, EmployeeDTO employeeDTO);
    List<EmployeeDTO> getAllEmployees();
    List<EmployeeDTO> getAllActiveEmployees();
    Page<EmployeeDTO> searchEmployees(EmployeeSearchCriteria criteria);
    void deleteEmployee(Long id);
    void restoreEmployee(Long id);
    boolean existsByCode(String code);
    String uploadEmployeeImage(Long employeeId, MultipartFile file);
    void removeEmployeeImage(Long employeeId);
}