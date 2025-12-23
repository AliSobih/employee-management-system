package com.company.employee_management_system.controller;


import com.company.employee_management_system.dto.ApiResponse;
import com.company.employee_management_system.dto.DepartmentDTO;
import com.company.employee_management_system.dto.DepartmentSearchCriteria;
import com.company.employee_management_system.dto.PaginationInfo;
import com.company.employee_management_system.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<DepartmentDTO>> createDepartment(@Valid @RequestBody DepartmentDTO departmentDTO) {
        DepartmentDTO createdDepartment = departmentService.createDepartment(departmentDTO);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdDepartment, "Department created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DepartmentDTO>> updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentDTO departmentDTO) {
        DepartmentDTO updatedDepartment = departmentService.updateDepartment(id, departmentDTO);
        return ResponseEntity.ok(ApiResponse.success(updatedDepartment, "Department updated successfully"));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<DepartmentDTO>>> getAllActiveDepartments() {
        List<DepartmentDTO> departments = departmentService.getAllActiveDepartments();
        return ResponseEntity.ok(ApiResponse.success(departments));
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<Page<DepartmentDTO>>> searchDepartments(
            @Valid @RequestBody DepartmentSearchCriteria criteria) {
        Page<DepartmentDTO> departmentPage = departmentService.searchDepartments(criteria);

        PaginationInfo pagination = PaginationInfo.builder()
                .page(departmentPage.getNumber())
                .size(departmentPage.getSize())
                .totalElements(departmentPage.getTotalElements())
                .totalPages(departmentPage.getTotalPages())
                .first(departmentPage.isFirst())
                .last(departmentPage.isLast())
                .build();

        ApiResponse<Page<DepartmentDTO>> response = ApiResponse.<Page<DepartmentDTO>>builder()
                .success(true)
                .data(departmentPage)
                .pagination(pagination)
                .build();

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Department deleted successfully"));
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreDepartment(@PathVariable Long id) {
        departmentService.restoreDepartment(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Department restored successfully"));
    }

    @GetMapping("/exists/code/{code}")
    public ResponseEntity<ApiResponse<Boolean>> checkCodeExists(@PathVariable String code) {
        boolean exists = departmentService.existsByCode(code);
        return ResponseEntity.ok(ApiResponse.success(exists));
    }

    @GetMapping("/exists/name/{name}")
    public ResponseEntity<ApiResponse<Boolean>> checkNameExists(@PathVariable String name) {
        boolean exists = departmentService.existsByName(name);
        return ResponseEntity.ok(ApiResponse.success(exists));
    }
}
