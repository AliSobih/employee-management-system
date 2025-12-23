package com.company.employee_management_system.repository.specification;


import com.company.employee_management_system.dto.DepartmentSearchCriteria;
import com.company.employee_management_system.entity.Department;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class DepartmentSpecification {

    public static Specification<Department> buildSpecification(DepartmentSearchCriteria criteria) {
        return Specification.where(
                withActiveStatus(criteria.getIsActive())
        ).and(
                Specification.allOf(
                        withCode(criteria.getCode()),
                        withName(criteria.getName()),
                        withDescription(criteria.getDescription())
                )
        );
    }

    public static Specification<Department> withActiveStatus(Boolean isActive) {
        return (root, query, criteriaBuilder) -> {
            if (isActive == null) {
                return criteriaBuilder.isTrue(root.get("isActive"));
            }
            return criteriaBuilder.equal(root.get("isActive"), isActive);
        };
    }

    public static Specification<Department> withCode(String code) {
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

    public static Specification<Department> withName(String name) {
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

    public static Specification<Department> withDescription(String description) {
        return (root, query, criteriaBuilder) -> {
            if (description == null || description.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("description")),
                    "%" + description.toLowerCase().trim() + "%"
            );
        };
    }
}
