package com.company.employee_management_system.repository;


import com.company.employee_management_system.entity.BaseEntity;
import com.company.employee_management_system.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee>, BaseRepository<Employee, Long> {

    boolean existsByCode(String code);
    boolean existsByCodeAndIdNot(String code, Long id);

    @Query("SELECT e FROM Employee e JOIN FETCH e.department WHERE e.isActive = true AND e.code = ?1")
    Optional<Employee> findActiveByCode(String code);

    @Query("SELECT DISTINCT e FROM Employee e JOIN FETCH e.department WHERE e.isActive = true")
    List<Employee> findAllActive();

    @Query("SELECT e FROM Employee e JOIN FETCH e.department WHERE e.isActive = true AND e.id = ?1")
    Optional<Employee> findActiveById(Long id);

    @Query("SELECT DISTINCT e FROM Employee e JOIN FETCH e.department")
    List<Employee> findAllWithDepartment();
}
