package com.company.employee_management_system.controller;


import com.company.employee_management_system.dto.ApiResponse;
import com.company.employee_management_system.dto.EmployeeDTO;
import com.company.employee_management_system.dto.EmployeeSearchCriteria;
import com.company.employee_management_system.dto.PaginationInfo;
import com.company.employee_management_system.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<EmployeeDTO>> createEmployee(@Valid @RequestBody EmployeeDTO employeeDTO) {
        EmployeeDTO createdEmployee = employeeService.createEmployee(employeeDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdEmployee, "Employee created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeDTO>> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeDTO employeeDTO) {
        EmployeeDTO updatedEmployee = employeeService.updateEmployee(id, employeeDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedEmployee, "Employee updated successfully"));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<EmployeeDTO>>> getAllActiveEmployees() {
        List<EmployeeDTO> employees = employeeService.getAllActiveEmployees();
        return ResponseEntity.ok(ApiResponse.success(employees));
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<Page<EmployeeDTO>>> searchEmployees(
            @Valid @RequestBody EmployeeSearchCriteria criteria) {
        Page<EmployeeDTO> employeePage = employeeService.searchEmployees(criteria);

        PaginationInfo pagination = PaginationInfo.builder()
                .page(employeePage.getNumber())
                .size(employeePage.getSize())
                .totalElements(employeePage.getTotalElements())
                .totalPages(employeePage.getTotalPages())
                .first(employeePage.isFirst())
                .last(employeePage.isLast())
                .build();

        ApiResponse<Page<EmployeeDTO>> response = ApiResponse.<Page<EmployeeDTO>>builder()
                .success(true)
                .data(employeePage)
                .pagination(pagination)
                .build();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Employee deleted successfully"));
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreEmployee(@PathVariable Long id) {
        employeeService.restoreEmployee(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Employee restored successfully"));
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<String>> uploadEmployeeImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        String imageUrl = employeeService.uploadEmployeeImage(id, file);
        return ResponseEntity.ok(ApiResponse.success(imageUrl, "Image uploaded successfully"));
    }

    @DeleteMapping("/{id}/image")
    public ResponseEntity<ApiResponse<Void>> removeEmployeeImage(@PathVariable Long id) {
        employeeService.removeEmployeeImage(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Image removed successfully"));
    }

    @GetMapping("/exists/code/{code}")
    public ResponseEntity<ApiResponse<Boolean>> checkCodeExists(@PathVariable String code) {
        boolean exists = employeeService.existsByCode(code);
        return ResponseEntity.ok(ApiResponse.success(exists));
    }
}
