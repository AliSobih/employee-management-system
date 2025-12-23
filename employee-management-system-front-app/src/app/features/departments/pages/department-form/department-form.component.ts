import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map, take } from 'rxjs/operators';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { Department } from '../../models/department.model';
import { DepartmentService } from '../../../../core/services/department.service';
import { VALIDATION_PATTERNS } from '../../../../utils/constants';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    CheckboxModule,
    ProgressSpinnerModule,
    MessageModule
  ],
  templateUrl: './department-form.component.html',
  styleUrls: ['./department-form.component.scss']
})
export class DepartmentFormComponent implements OnInit, OnChanges {
  @Input() department: Department | null = null;
  @Input() isEditMode: boolean = false;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  departmentForm!: FormGroup;
  loading: boolean = false;
  submitting: boolean = false;

  // Duplicate validation flags
  checkingCode: boolean = false;
  checkingName: boolean = false;
  codeExists: boolean = false;
  nameExists: boolean = false;

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupDuplicateValidators();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['department'] && this.departmentForm) {
      this.populateForm();
    }

    if (changes['visible'] && this.visible && this.departmentForm) {
      this.resetValidationFlags();
    }
  }

  initializeForm(): void {
    this.departmentForm = this.fb.group({
      code: ['', [
        Validators.required,
        Validators.pattern(VALIDATION_PATTERNS.code)
      ]],
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        Validators.pattern(VALIDATION_PATTERNS.name)
      ]],
      description: ['', [
        Validators.maxLength(500)
      ]],
      isActive: [true]
    });

    this.populateForm();
  }

  populateForm(): void {
    if (this.department) {
      this.departmentForm.patchValue({
        code: this.department.code,
        name: this.department.name,
        description: this.department.description || '',
        isActive: this.department.isActive ?? true
      });
    } else {
      this.departmentForm.reset({
        code: '',
        name: '',
        description: '',
        isActive: true
      });
    }
  }

  setupDuplicateValidators(): void {
    // Code duplicate validator
    const codeControl = this.departmentForm.get('code');
    if (codeControl) {
      codeControl.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((code: string) => {
          if (!code || code.length < 2) {
            this.codeExists = false;
            this.checkingCode = false;
            return of(false);
          }

          this.checkingCode = true;
          
          // In edit mode, check if code exists for another department
          if (this.isEditMode && this.department?.id) {
            return this.departmentService.checkCodeExists(code).pipe(
              map(response => {
                const exists = response.success && response.data === true;
                return exists && code !== this.department?.code;
              }),
              catchError(() => {
                this.checkingCode = false;
                return of(false);
              })
            );
          } else {
            return this.departmentService.checkCodeExists(code).pipe(
              map(response => response.success && response.data === true),
              catchError(() => {
                this.checkingCode = false;
                return of(false);
              })
            );
          }
        })
      ).subscribe({
        next: (exists: boolean) => {
          this.codeExists = exists;
          this.checkingCode = false;
          this.updateControlErrors(codeControl, 'code', exists);
        },
        error: () => {
          this.codeExists = false;
          this.checkingCode = false;
        }
      });
    }

    // Name duplicate validator
    const nameControl = this.departmentForm.get('name');
    if (nameControl) {
      nameControl.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((name: string) => {
          if (!name || name.length < 2) {
            this.nameExists = false;
            this.checkingName = false;
            return of(false);
          }

          this.checkingName = true;
          
          // In edit mode, check if name exists for another department
          if (this.isEditMode && this.department?.id) {
            return this.departmentService.checkNameExists(name).pipe(
              map(response => {
                const exists = response.success && response.data === true;
                return exists && name !== this.department?.name;
              }),
              catchError(() => {
                this.checkingName = false;
                return of(false);
              })
            );
          } else {
            return this.departmentService.checkNameExists(name).pipe(
              map(response => response.success && response.data === true),
              catchError(() => {
                this.checkingName = false;
                return of(false);
              })
            );
          }
        })
      ).subscribe({
        next: (exists: boolean) => {
          this.nameExists = exists;
          this.checkingName = false;
          this.updateControlErrors(nameControl, 'name', exists);
        },
        error: () => {
          this.nameExists = false;
          this.checkingName = false;
        }
      });
    }
  }

  updateControlErrors(control: AbstractControl, fieldName: string, exists: boolean): void {
    if (exists) {
      control.setErrors({ ...control.errors, duplicate: true });
    } else {
      const errors = control.errors;
      if (errors) {
        delete errors['duplicate'];
        if (Object.keys(errors).length === 0) {
          control.setErrors(null);
        } else {
          control.setErrors(errors);
        }
      }
    }
  }

  resetValidationFlags(): void {
    this.codeExists = false;
    this.nameExists = false;
    this.checkingCode = false;
    this.checkingName = false;
    
    // Clear duplicate errors
    const codeControl = this.departmentForm.get('code');
    const nameControl = this.departmentForm.get('name');
    
    if (codeControl?.errors?.['duplicate']) {
      this.updateControlErrors(codeControl, 'code', false);
    }
    
    if (nameControl?.errors?.['duplicate']) {
      this.updateControlErrors(nameControl, 'name', false);
    }
  }

  get formTitle(): string {
    if (this.isEditMode) {
      return this.department ? `Edit Department: ${this.department.name}` : 'Edit Department';
    }
    return 'Add New Department';
  }

  get submitButtonText(): string {
    return this.submitting 
      ? (this.isEditMode ? 'Updating...' : 'Creating...') 
      : (this.isEditMode ? 'Update' : 'Create');
  }

  onClose(): void {
    this.visibleChange.emit(false);
    this.departmentForm.reset({
      code: '',
      name: '',
      description: '',
      isActive: true
    });
    this.resetValidationFlags();
  }

  onSubmit(): void {
    if (this.departmentForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    if (this.codeExists || this.nameExists) {
      return;
    }

    this.submitting = true;
    const formData = this.departmentForm.value;

    if (this.isEditMode && this.department?.id) {
      // Update existing department
      const updatedDepartment: Department = {
        ...this.department,
        ...formData
      };

      this.departmentService.updateDepartment(this.department.id, updatedDepartment).subscribe({
        next: (response) => {
          this.submitting = false;
          if (response.success) {
            this.onClose();
            this.visibleChange.emit(true); // Emit success
          }
        },
        error: (error) => {
          this.submitting = false;
          console.error('Update error:', error);
        }
      });
    } else {
      // Create new department
      const newDepartment: Department = formData;

      this.departmentService.createDepartment(newDepartment).subscribe({
        next: (response) => {
          this.submitting = false;
          if (response.success) {
            this.onClose();
            this.visibleChange.emit(true); // Emit success
          }
        },
        error: (error) => {
          this.submitting = false;
          console.error('Create error:', error);
        }
      });
    }
  }

  markAllAsTouched(): void {
    Object.values(this.departmentForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.departmentForm.get(controlName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;

    if (errors['required']) {
      return `${this.getFieldLabel(controlName)} is required`;
    }

    if (errors['pattern']) {
      if (controlName === 'code') {
        return 'Code can only contain letters, numbers, hyphens, and underscores';
      }
      if (controlName === 'name') {
        return 'Name can only contain letters, spaces, dots, apostrophes, and hyphens';
      }
    }

    if (errors['minlength']) {
      return `${this.getFieldLabel(controlName)} must be at least ${errors['minlength'].requiredLength} characters`;
    }

    if (errors['maxlength']) {
      return `${this.getFieldLabel(controlName)} cannot exceed ${errors['maxlength'].requiredLength} characters`;
    }

    if (errors['duplicate']) {
      return `${this.getFieldLabel(controlName)} already exists`;
    }

    return 'Invalid value';
  }

  getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      code: 'Department code',
      name: 'Department name',
      description: 'Description'
    };
    return labels[controlName] || controlName;
  }
}