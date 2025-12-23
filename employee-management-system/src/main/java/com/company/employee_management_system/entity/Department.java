package com.company.employee_management_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "departments",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "code"),
                @UniqueConstraint(columnNames = "name")
        },
        indexes = {
                @Index(name = "idx_departments_is_active", columnList = "is_active")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Department extends BaseEntity {

    @NotBlank(message = "Department code is required")
    @Column(unique = true, nullable = false)
    private String code;

    @NotBlank(message = "Department name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(unique = true, nullable = false)
    private String name;

    @Column(length = 500)
    private String description;
}
