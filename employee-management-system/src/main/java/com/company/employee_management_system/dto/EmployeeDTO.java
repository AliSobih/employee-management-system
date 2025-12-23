package com.company.employee_management_system.dto;


import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmployeeDTO {

    private Long id;

    @NotBlank(message = "Employee code is required")
    @Pattern(regexp = "^[A-Za-z0-9_-]*$", message = "Code can only contain letters, numbers, hyphens, and underscores")
    private String code;

    @NotBlank(message = "Employee name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Pattern(regexp = "^[A-Za-z\\s.'-]*$", message = "Name can only contain letters, spaces, dots, apostrophes, and hyphens")
    private String name;

    @Past(message = "Date of birth must be in the past")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    @Size(max = 500, message = "Address cannot exceed 500 characters")
    private String address;

    @Pattern(regexp = "^01[0-9]{9}$", message = "Mobile number must be exactly 11 digits")
    private String mobile;

    @NotNull(message = "Salary is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Salary must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Salary must have at most 10 integer digits and 2 fraction digits")
    private BigDecimal salary;

    @NotNull(message = "Department is required")
    private Long departmentId;

    private String departmentName;
    private String departmentCode;

    private String imageUrl;

    private Boolean isActive;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

}