package com.company.employee_management_system.repository;


import com.company.employee_management_system.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long>, JpaSpecificationExecutor<Department> {

    Optional<Department> findByCode(String code);
    Optional<Department> findByName(String name);
    boolean existsByCode(String code);
    boolean existsByName(String name);
    boolean existsByCodeAndIdNot(String code, Long id);
    boolean existsByNameAndIdNot(String name, Long id);

    @Query("SELECT d FROM Department d WHERE d.isActive = true ORDER BY d.name")
    List<Department> findAllActive();

    @Query("SELECT d FROM Department d WHERE d.isActive = true AND d.code = ?1")
    Optional<Department> findActiveByCode(String code);
}
