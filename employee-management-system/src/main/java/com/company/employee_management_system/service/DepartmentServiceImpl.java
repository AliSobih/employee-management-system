package com.company.employee_management_system.service;


import com.company.employee_management_system.dto.DepartmentDTO;
import com.company.employee_management_system.dto.DepartmentSearchCriteria;
import com.company.employee_management_system.entity.Department;
import com.company.employee_management_system.exception.DuplicateResourceException;
import com.company.employee_management_system.exception.ResourceNotFoundException;
import com.company.employee_management_system.repository.DepartmentRepository;
import com.company.employee_management_system.repository.specification.DepartmentSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    @CacheEvict(value = {"departments_active", "department_exists_code", "department_exists_name"}, allEntries = true)
    public DepartmentDTO createDepartment(DepartmentDTO departmentDTO) {
        log.info("Creating department with code: {}", departmentDTO.getCode());

        validateDepartmentForCreate(departmentDTO);

        Department department = modelMapper.map(departmentDTO, Department.class);
        Department savedDepartment = departmentRepository.save(department);

        return convertToDTO(savedDepartment);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"departments_active", "department_exists_code", "department_exists_name"}, allEntries = true)
    public DepartmentDTO updateDepartment(Long id, DepartmentDTO departmentDTO) {
        log.info("Updating department with id: {}", id);

        Department existingDepartment = getActiveDepartmentById(id);
        validateDepartmentForUpdate(departmentDTO, id);

        modelMapper.map(departmentDTO, existingDepartment);
        Department updatedDepartment = departmentRepository.save(existingDepartment);

        return convertToDTO(updatedDepartment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentDTO> getAllDepartments() {
        log.info("Fetching all departments");

        return departmentRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "departments_active")
    public List<DepartmentDTO> getAllActiveDepartments() {
        log.info("Fetching all active departments");

        return departmentRepository.findAllActive()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DepartmentDTO> searchDepartments(DepartmentSearchCriteria criteria) {
        log.info("Searching departments with criteria: {}", criteria);

        Specification<Department> spec = DepartmentSpecification.buildSpecification(criteria);
        Sort sort = Sort.by(criteria.getSortDirection().equalsIgnoreCase("DESC")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC,
                criteria.getSortBy());

        Pageable pageable = PageRequest.of(criteria.getPage(), criteria.getSize(), sort);

        Page<Department> departmentPage = departmentRepository.findAll(spec, pageable);
        return departmentPage.map(this::convertToDTO);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"departments_active", "department_exists_code", "department_exists_name"}, allEntries = true)
    public void deleteDepartment(Long id) {
        log.info("Deleting department with id: {}", id);

        Department department = getActiveDepartmentById(id);
        department.setIsActive(false);
        departmentRepository.save(department);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"departments_active", "department_exists_code", "department_exists_name"}, allEntries = true)
    public void restoreDepartment(Long id) {
        log.info("Restoring department with id: {}", id);

        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        if (Boolean.TRUE.equals(department.getIsActive())) {
            throw new IllegalArgumentException("Department is already active");
        }

        department.setIsActive(true);
        departmentRepository.save(department);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "department_exists_code", key = "#code")
    public boolean existsByCode(String code) {
        return departmentRepository.existsByCode(code);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "department_exists_name", key = "#name")
    public boolean existsByName(String name) {
        return departmentRepository.existsByName(name);
    }

    private void validateDepartmentForCreate(DepartmentDTO dto) {
        if (departmentRepository.existsByCode(dto.getCode())) {
            throw new DuplicateResourceException("Department code already exists: " + dto.getCode());
        }

        if (departmentRepository.existsByName(dto.getName())) {
            throw new DuplicateResourceException("Department name already exists: " + dto.getName());
        }
    }

    private void validateDepartmentForUpdate(DepartmentDTO dto, Long id) {
        Department existingDepartment = getActiveDepartmentById(id);

        if (!dto.getCode().equals(existingDepartment.getCode()) &&
                departmentRepository.existsByCodeAndIdNot(dto.getCode(), id)) {
            throw new DuplicateResourceException("Department code already exists: " + dto.getCode());
        }

        if (!dto.getName().equals(existingDepartment.getName()) &&
                departmentRepository.existsByNameAndIdNot(dto.getName(), id)) {
            throw new DuplicateResourceException("Department name already exists: " + dto.getName());
        }
    }

    private Department getActiveDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .map(department -> {
                    if (Boolean.FALSE.equals(department.getIsActive())) {
                        throw new ResourceNotFoundException("Department not found with id: " + id);
                    }
                    return department;
                })
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
    }

    private DepartmentDTO convertToDTO(Department department) {
        return modelMapper.map(department, DepartmentDTO.class);
    }
}
