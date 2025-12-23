package com.company.employee_management_system.service;

import com.company.employee_management_system.dto.EmployeeDTO;
import com.company.employee_management_system.dto.EmployeeSearchCriteria;
import com.company.employee_management_system.entity.Department;
import com.company.employee_management_system.entity.Employee;
import com.company.employee_management_system.exception.DuplicateResourceException;
import com.company.employee_management_system.exception.ResourceNotFoundException;
import com.company.employee_management_system.repository.DepartmentRepository;
import com.company.employee_management_system.repository.EmployeeRepository;
import com.company.employee_management_system.repository.specification.EmployeeSpecification;
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
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final ImageService imageService;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    @CacheEvict(value = {"employees_active", "employee_exists_code"}, allEntries = true)
    public EmployeeDTO createEmployee(EmployeeDTO employeeDTO) {
        log.info("Creating employee with code: {}", employeeDTO.getCode());

        validateEmployeeForCreate(employeeDTO);

        Department department = getActiveDepartmentById(employeeDTO.getDepartmentId());
        Employee employee = convertToEntity(employeeDTO);
        employee.setDepartment(department);

        Employee savedEmployee = employeeRepository.save(employee);
        return convertToDTO(savedEmployee);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"employees_active", "employee_exists_code"}, allEntries = true)
    public EmployeeDTO updateEmployee(Long id, EmployeeDTO employeeDTO) {
        log.info("Updating employee with id: {}", id);

        Employee existingEmployee = getActiveEmployeeById(id);
        validateEmployeeForUpdate(employeeDTO, id);

        Department department = getActiveDepartmentById(employeeDTO.getDepartmentId());
        updateEntityFromDTO(existingEmployee, employeeDTO);
        existingEmployee.setDepartment(department);

        Employee updatedEmployee = employeeRepository.save(existingEmployee);
        return convertToDTO(updatedEmployee);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "employees_active")
    public List<EmployeeDTO> getAllEmployees() {
        log.info("Fetching all employees");

        return employeeRepository.findAllWithDepartment()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "employees_active")
    public List<EmployeeDTO> getAllActiveEmployees() {
        log.info("Fetching all active employees");

        return employeeRepository.findAllActive()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeDTO> searchEmployees(EmployeeSearchCriteria criteria) {
        log.info("Searching employees with criteria: {}", criteria);

        Specification<Employee> spec = EmployeeSpecification.buildSpecification(criteria);
        Sort sort = createSort(criteria);
        Pageable pageable = PageRequest.of(criteria.getPage(), criteria.getSize(), sort);

        Page<Employee> employeePage = employeeRepository.findAll(spec, pageable);
        return employeePage.map(this::convertToDTO);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"employees_active", "employee_exists_code"}, allEntries = true)
    public void deleteEmployee(Long id) {
        log.info("Deleting employee with id: {}", id);

        Employee employee = getActiveEmployeeById(id);
        employee.setIsActive(false);
        employeeRepository.save(employee);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"employees_active", "employee_exists_code"}, allEntries = true)
    public void restoreEmployee(Long id) {
        log.info("Restoring employee with id: {}", id);

        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        if (Boolean.TRUE.equals(employee.getIsActive())) {
            throw new IllegalArgumentException("Employee is already active");
        }

        employee.setIsActive(true);
        employeeRepository.save(employee);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "employee_exists_code", key = "#code")
    public boolean existsByCode(String code) {
        return employeeRepository.existsByCode(code);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"employees_active"}, allEntries = true)
    public String uploadEmployeeImage(Long employeeId, MultipartFile file) {
        log.info("Uploading image for employee id: {}", employeeId);

        Employee employee = getActiveEmployeeById(employeeId);

        // Delete existing image if any
        if (employee.getImageUrl() != null) {
            imageService.deleteImage(employee.getImageUrl());
        }

        // Upload new image - returns only filename
        String filename = imageService.uploadImage(file);
        employee.setImageUrl(filename); // Store only filename in DB
        employeeRepository.save(employee);

        log.info("Image uploaded successfully for employee id: {}. Filename: {}", employeeId, filename);
        return filename; // Returns only filename
    }

    @Override
    @Transactional
    @CacheEvict(value = {"employees_active"}, allEntries = true)
    public void removeEmployeeImage(Long employeeId) {
        log.info("Removing image for employee id: {}", employeeId);

        Employee employee = getActiveEmployeeById(employeeId);

        if (employee.getImageUrl() != null) {
            imageService.deleteImage(employee.getImageUrl());
            employee.setImageUrl(null);
            employeeRepository.save(employee);
        }
    }

    // باقي الـ methods كما هي بدون تغيير...
    private void validateEmployeeForCreate(EmployeeDTO dto) {
        if (employeeRepository.existsByCode(dto.getCode())) {
            throw new DuplicateResourceException("Employee code already exists: " + dto.getCode());
        }
        validateCommonEmployeeData(dto);
    }

    private void validateEmployeeForUpdate(EmployeeDTO dto, Long id) {
        Employee existingEmployee = getActiveEmployeeById(id);

        if (!dto.getCode().equals(existingEmployee.getCode()) &&
                employeeRepository.existsByCodeAndIdNot(dto.getCode(), id)) {
            throw new DuplicateResourceException("Employee code already exists: " + dto.getCode());
        }
        validateCommonEmployeeData(dto);
    }

    private void validateCommonEmployeeData(EmployeeDTO dto) {
        if (dto.getSalary() == null || dto.getSalary().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Salary must be greater than 0");
        }

        if (dto.getMobile() != null && !dto.getMobile().isEmpty()) {
            if (!dto.getMobile().matches("^01[0-9]{9}$")) {
                throw new IllegalArgumentException("Mobile number must be 11 digits");
            }
        }

        if (dto.getDateOfBirth() != null && dto.getDateOfBirth().isAfter(java.time.LocalDate.now().minusYears(18))) {
            throw new IllegalArgumentException("Employee must be at least 18 years old");
        }
    }

    private Department getActiveDepartmentById(Long departmentId) {
        return departmentRepository.findById(departmentId)
                .map(department -> {
                    if (Boolean.FALSE.equals(department.getIsActive())) {
                        throw new IllegalArgumentException("Department is inactive");
                    }
                    return department;
                })
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found with id: " + departmentId));
    }

    private Employee getActiveEmployeeById(Long id) {
        return employeeRepository.findActiveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Active employee not found with id: " + id));
    }

    private Employee convertToEntity(EmployeeDTO dto) {
        return modelMapper.map(dto, Employee.class);
    }

    private EmployeeDTO convertToDTO(Employee employee) {
        EmployeeDTO dto = modelMapper.map(employee, EmployeeDTO.class);
        dto.setDepartmentName(employee.getDepartment().getName());
        dto.setDepartmentCode(employee.getDepartment().getCode());
        return dto;
    }

    private void updateEntityFromDTO(Employee employee, EmployeeDTO dto) {
        modelMapper.map(dto, employee);
    }

    private Sort createSort(EmployeeSearchCriteria criteria) {
        Sort.Direction direction = criteria.getSortDirection().equalsIgnoreCase("DESC")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        if (criteria.getSortBy().equals("departmentName")) {
            return Sort.by(direction, "department.name");
        }

        return Sort.by(direction, criteria.getSortBy());
    }
}
