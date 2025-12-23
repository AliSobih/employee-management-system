import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  map,
} from 'rxjs/operators';

import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { FileUploadModule } from 'primeng/fileupload';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';

import { Employee } from '../../models/employee.model';
import { Department } from '../../../departments/models/department.model';
import { EmployeeService } from '../../../../core/services/employee.service';
import { DepartmentService } from '../../../../core/services/department.service';
import { VALIDATION_PATTERNS } from '../../../../utils/constants';
import { environment } from '../../../../environment';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    DropdownModule,
    CalendarModule,
    FileUploadModule,
    CheckboxModule,
    ProgressSpinnerModule,
    MessageModule,
  ],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss'],
})
export class EmployeeFormComponent implements OnInit, OnChanges {
  @Input() employee: Employee | null = null;
  @Input() isEditMode: boolean = false;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  employeeForm!: FormGroup;
  departments: Department[] = [];
  loadingDepartments: boolean = false;
  submitting: boolean = false;
  uploadingImage: boolean = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  maxFileSize: number = 2 * 1024 * 1024; // 2MB
  acceptedFileTypes: string = 'image/*';

  // Duplicate validation flags
  checkingCode: boolean = false;
  codeExists: boolean = false;

  maxDate: Date = new Date();
  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadDepartments();
    this.setupDuplicateValidator();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['employee'] && this.employeeForm) {
      this.populateForm();
    }

    if (changes['visible'] && this.visible && this.employeeForm) {
      this.resetValidationFlags();
    }
  }

  initializeForm(): void {
    this.employeeForm = this.fb.group({
      code: [
        '',
        [Validators.required, Validators.pattern(VALIDATION_PATTERNS.code)],
      ],
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern(VALIDATION_PATTERNS.name),
        ],
      ],
      dateOfBirth: [null],
      address: ['', [Validators.maxLength(500)]],
      mobile: ['', [Validators.pattern(VALIDATION_PATTERNS.mobile)]],
      salary: [null, [Validators.required, Validators.min(0.01)]],
      departmentId: [null, [Validators.required]],
      isActive: [true],
    });

    this.populateForm();
  }

  loadDepartments(): void {
    this.loadingDepartments = true;
    this.departmentService.getAllActiveDepartments().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.departments = response.data;
        }
        this.loadingDepartments = false;
      },
      error: (error) => {
        console.error('Failed to load departments:', error);
        this.loadingDepartments = false;
      },
    });
  }

  populateForm(): void {
    if (this.employee) {
      this.employeeForm.patchValue({
        code: this.employee.code,
        name: this.employee.name,
        dateOfBirth: this.employee.dateOfBirth
          ? new Date(this.employee.dateOfBirth)
          : null,
        address: this.employee.address || '',
        mobile: this.employee.mobile || '',
        salary: this.employee.salary,
        departmentId: this.employee.departmentId,
        isActive: this.employee.isActive ?? true,
      });

      if (this.employee.imageUrl) {
        this.imagePreview = `${environment.apiUrl}/api/v1/images/download/${this.employee.imageUrl}`;
      }
    } else {
      this.employeeForm.reset({
        code: '',
        name: '',
        dateOfBirth: null,
        address: '',
        mobile: '',
        salary: null,
        departmentId: null,
        isActive: true,
      });
      this.imagePreview = null;
      this.selectedFile = null;
    }
  }

  setupDuplicateValidator(): void {
    const codeControl = this.employeeForm.get('code');
    if (codeControl) {
      codeControl.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((code: string) => {
            if (!code || code.length < 2) {
              this.codeExists = false;
              this.checkingCode = false;
              return of(false);
            }

            this.checkingCode = true;

            // In edit mode, check if code exists for another employee
            if (this.isEditMode && this.employee?.id) {
              return this.employeeService.checkCodeExists(code).pipe(
                map((response) => {
                  const exists = response.success && response.data === true;
                  return exists && code !== this.employee?.code;
                }),
                catchError(() => {
                  this.checkingCode = false;
                  return of(false);
                })
              );
            } else {
              return this.employeeService.checkCodeExists(code).pipe(
                map((response) => response.success && response.data === true),
                catchError(() => {
                  this.checkingCode = false;
                  return of(false);
                })
              );
            }
          })
        )
        .subscribe({
          next: (exists: boolean) => {
            this.codeExists = exists;
            this.checkingCode = false;
            this.updateControlErrors(codeControl, 'code', exists);
          },
          error: () => {
            this.codeExists = false;
            this.checkingCode = false;
          },
        });
    }
  }

  updateControlErrors(
    control: AbstractControl,
    fieldName: string,
    exists: boolean
  ): void {
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
    this.checkingCode = false;

    const codeControl = this.employeeForm.get('code');
    if (codeControl?.errors?.['duplicate']) {
      this.updateControlErrors(codeControl, 'code', false);
    }
  }

  onFileSelect(event: any): void {
    const file = event.files[0];

    if (!file) return;

    // Validate file size
    if (file.size > this.maxFileSize) {
      alert(
        `File size should not exceed ${this.maxFileSize / (1024 * 1024)}MB`
      );
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    this.selectedFile = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  get formTitle(): string {
    if (this.isEditMode) {
      return this.employee
        ? `Edit Employee: ${this.employee.name}`
        : 'Edit Employee';
    }
    return 'Add New Employee';
  }

  get submitButtonText(): string {
    return this.submitting
      ? this.isEditMode
        ? 'Updating...'
        : 'Creating...'
      : this.isEditMode
      ? 'Update'
      : 'Create';
  }

  onClose(): void {
    this.visibleChange.emit(false);
    this.employeeForm.reset({
      code: '',
      name: '',
      dateOfBirth: null,
      address: '',
      mobile: '',
      salary: null,
      departmentId: null,
      isActive: true,
    });
    this.imagePreview = null;
    this.selectedFile = null;
    this.resetValidationFlags();
  }

  async onSubmit(): Promise<void> {
    if (this.employeeForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    if (this.codeExists) {
      return;
    }

    this.submitting = true;
    const formData = this.employeeForm.value;

    try {
      if (this.isEditMode && this.employee?.id) {
        // Update existing employee
        await this.updateEmployee(this.employee.id, formData);
      } else {
        // Create new employee
        await this.createEmployee(formData);
      }
    } catch (error) {
      console.error('Submit error:', error);
      this.submitting = false;
    }
  }

  private async updateEmployee(id: number, formData: any): Promise<void> {
    const updatedEmployee: Employee = {
      ...this.employee!,
      ...formData,
      dateOfBirth: formData.dateOfBirth
        ? this.formatDateForAPI(formData.dateOfBirth)
        : null,
    };

    this.employeeService.updateEmployee(id, updatedEmployee).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Upload image if selected
          if (this.selectedFile && response.data.id) {
            this.uploadImage(response.data.id);
          }

          if (
            !this.imagePreview &&
            this.employee?.imageUrl &&
            response.data.id
          ) {
            this.removeImageFromServer(response.data.id);
          }

          this.onClose();
          this.visibleChange.emit(true); // Emit success
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Update error:', error);
        this.submitting = false;
      },
    });
  }

  private async createEmployee(formData: any): Promise<void> {
    const newEmployee: Employee = {
      ...formData,
      dateOfBirth: formData.dateOfBirth
        ? this.formatDateForAPI(formData.dateOfBirth)
        : null,
    };

    this.employeeService.createEmployee(newEmployee).subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.id) {
          if (this.selectedFile) {
            this.uploadImage(response.data.id);
          }

          this.onClose();
          this.visibleChange.emit(true);
        }
        this.submitting = false;
      },
      error: (error) => {
        console.error('Create error:', error);
        this.submitting = false;
      },
    });
  }

  private async uploadImage(employeeId: number): Promise<void> {
    if (!this.selectedFile) return;

    this.uploadingImage = true;
    try {
      this.employeeService
        .uploadEmployeeImage(employeeId, this.selectedFile)
        .subscribe(() => {});
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      this.uploadingImage = false;
    }
  }

  private removeImageFromServer(employeeId: number) {
    this.employeeService.removeEmployeeImage(employeeId).subscribe(() => {});
  }

  private formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  markAllAsTouched(): void {
    Object.values(this.employeeForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.employeeForm.get(controlName);

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
      if (controlName === 'mobile') {
        return 'Mobile number must be exactly 11 digits starting with 01';
      }
    }

    if (errors['minlength']) {
      return `${this.getFieldLabel(controlName)} must be at least ${
        errors['minlength'].requiredLength
      } characters`;
    }

    if (errors['maxlength']) {
      return `${this.getFieldLabel(controlName)} cannot exceed ${
        errors['maxlength'].requiredLength
      } characters`;
    }

    if (errors['min']) {
      return `${this.getFieldLabel(controlName)} must be greater than ${
        errors['min'].min
      }`;
    }

    if (errors['duplicate']) {
      return `${this.getFieldLabel(controlName)} already exists`;
    }

    return 'Invalid value';
  }

  getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      code: 'Employee code',
      name: 'Employee name',
      dateOfBirth: 'Date of birth',
      address: 'Address',
      mobile: 'Mobile number',
      salary: 'Salary',
      departmentId: 'Department',
    };
    return labels[controlName] || controlName;
  }

  getDepartmentName(departmentId: number): string {
    const department = this.departments.find((d) => d.id === departmentId);
    return department ? department.name : `Department #${departmentId}`;
  }
}
