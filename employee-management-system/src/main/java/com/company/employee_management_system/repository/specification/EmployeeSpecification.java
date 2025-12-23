package com.company.employee_management_system.repository.specification;


import com.company.employee_management_system.dto.EmployeeSearchCriteria;
import com.company.employee_management_system.entity.Employee;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class EmployeeSpecification {

    public static Specification<Employee> buildSpecification(EmployeeSearchCriteria criteria) {
        return Specification.where(
                withActiveStatus(criteria.getIsActive())
        ).and(
                Specification.allOf(
                        fetchDepartment(),
                        withCode(criteria.getCode()),
                        withName(criteria.getName()),
                        withDepartment(criteria.getDepartmentId()),
                        withMobile(criteria.getMobile()),
                        withSalaryBetween(criteria.getMinSalary(), criteria.getMaxSalary())
                )
        );
    }

    public static Specification<Employee> withActiveStatus(Boolean isActive) {
        return (root, query, criteriaBuilder) -> {
            if (isActive == null) {
                return criteriaBuilder.isTrue(root.get("isActive"));
            }
            return criteriaBuilder.equal(root.get("isActive"), isActive);
        };
    }

    public static Specification<Employee> fetchDepartment() {
        return (root, query, cb) -> {
            if (Employee.class.equals(query.getResultType())) {
                root.fetch("department");
                query.distinct(true);
            }
            return cb.conjunction();
        };
    }

    public static Specification<Employee> withCode(String code) {
        return (root, query, criteriaBuilder) -> {
            if (code == null || code.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("code")),
                    "%" + code.toLowerCase().trim() + "%"
            );
        };
    }

    public static Specification<Employee> withName(String name) {
        return (root, query, criteriaBuilder) -> {
            if (name == null || name.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")),
                    "%" + name.toLowerCase().trim() + "%"
            );
        };
    }

    public static Specification<Employee> withDepartment(Long departmentId) {
        return (root, query, criteriaBuilder) -> {
            if (departmentId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("department").get("id"), departmentId);
        };
    }

    public static Specification<Employee> withMobile(String mobile) {
        return (root, query, criteriaBuilder) -> {
            if (mobile == null || mobile.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(root.get("mobile"), "%" + mobile.trim() + "%");
        };
    }

    public static Specification<Employee> withSalaryBetween(BigDecimal minSalary, BigDecimal maxSalary) {
        return (root, query, criteriaBuilder) -> {
            if (minSalary == null && maxSalary == null) {
                return criteriaBuilder.conjunction();
            }

            if (minSalary != null && maxSalary != null) {
                return criteriaBuilder.between(root.get("salary"), minSalary, maxSalary);
            } else if (minSalary != null) {
                return criteriaBuilder.greaterThanOrEqualTo(root.get("salary"), minSalary);
            } else {
                return criteriaBuilder.lessThanOrEqualTo(root.get("salary"), maxSalary);
            }
        };
    }
}
