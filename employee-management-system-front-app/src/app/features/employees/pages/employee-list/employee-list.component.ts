import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { Employee } from '../../models/employee.model';
import { Department } from '../../../departments/models/department.model';
import { EmployeeSearchCriteria } from '../../models/employee-search-criteria';
import { STATUS_OPTIONS } from '../../../../utils/constants';
import { PaginationInfo } from '../../../../core/models/pagination-info.model';
import { EmployeeService } from '../../../../core/services/employee.service';
import { DepartmentService } from '../../../../core/services/department.service';
import { EmployeeFormComponent } from '../employee-form/employee-form.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { environment } from '../../../../environment';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    TagModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    CardModule,
    EmployeeFormComponent,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
  providers: [ConfirmationService],
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  departments: Department[] = [];
  loading: boolean = false;
  loadingDepartments: boolean = false;
  showDialog: boolean = false;
  selectedEmployee: Employee | null = null;
  isEditMode: boolean = false;

  // Search Criteria
  searchCriteria: EmployeeSearchCriteria = {
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortDirection: 'DESC',
  };

  // Pagination
  paginationInfo: PaginationInfo | null = null;
  totalRecords: number = 0;
  rows: number = 10;

  // Options
  statusOptions = STATUS_OPTIONS;

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadDepartmentsList();
    this.loadEmployees();
  }

  loadDepartmentsList(): void {
    this.loadingDepartments = true;
    this.departmentService.getAllActiveDepartments().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.departments = response.data;
        }
        this.loadingDepartments = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load departments',
          life: 5000,
        });
        this.loadingDepartments = false;
      },
    });
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.searchEmployees(this.searchCriteria).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.employees = response.data.content || response.data;
          this.paginationInfo = response.pagination || null;

          if (this.paginationInfo) {
            this.totalRecords = this.paginationInfo.totalElements;
            this.rows = this.paginationInfo.size;
          }
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load employees',
          life: 5000,
        });
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.searchCriteria.page = 0; // Reset to first page
    this.loadEmployees();
  }

  resetFilters(): void {
    this.searchCriteria = {
      page: 0,
      size: 10,
      sortBy: 'createdAt',
      sortDirection: 'DESC',
    };
    this.loadEmployees();
  }

  onPageChange(event: any): void {
    this.searchCriteria.page = event.first / event.rows;
    this.searchCriteria.size = event.rows;
    this.loadEmployees();
  }

  openAddDialog(): void {
    this.selectedEmployee = null;
    this.isEditMode = false;
    this.showDialog = true;
  }

  openEditDialog(employee: Employee): void {
    this.selectedEmployee = { ...employee };
    this.isEditMode = true;
    this.showDialog = true;
  }

  openViewDialog(employee: Employee): void {
    this.selectedEmployee = { ...employee };
    this.isEditMode = false;
    this.showDialog = true;
  }

  deleteEmployee(employee: Employee): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete employee "${employee.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (employee.id) {
          this.employeeService.deleteEmployee(employee.id).subscribe({
            next: (response) => {
              if (response.success) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: response.message || 'Employee deleted successfully',
                  life: 3000,
                });
                this.loadEmployees();
              }
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete employee',
                life: 5000,
              });
            },
          });
        }
      },
    });
  }

  get displayedItemsCount(): number {
    if (!this.paginationInfo) return 0;
    return Math.min(
      (this.paginationInfo.page + 1) * this.paginationInfo.size,
      this.paginationInfo.totalElements
    );
  }

  onDialogClose(success: boolean): void {
    this.showDialog = false;
    this.selectedEmployee = null;
    if (success) {
      this.loadEmployees();
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatCurrency(amount?: number): string {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  getStatusSeverity(isActive: boolean | undefined): string {
    return isActive ? 'success' : 'danger';
  }

  getStatusText(isActive: boolean | undefined): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getDepartmentName(employee: Employee): string {
    if (employee.departmentName) {
      return employee.departmentName;
    }

    if (employee.departmentId) {
      const department = this.departments.find(
        (d) => d.id === employee.departmentId
      );
      return department ? department.name : `Dept #${employee.departmentId}`;
    }

    return '-';
  }

  get departmentName(): string {
    return (
      this.departments.find((d) => d.id === this.searchCriteria.departmentId)
        ?.name || ''
    );
  }

  /**
   * الحصول على URL كامل للصورة
   * employee.imageUrl يحتوي فقط على اسم الملف: "filename.jpg"
   */
  getAvatarUrl(employee: Employee): string {
    if (employee.imageUrl) {
      // بناء الـ URL الصحيح: /api/v1/images/download/filename.jpg
      const imageUrl = `${environment.apiUrl}/api/v1/images/download/${employee.imageUrl}`;
      return imageUrl;
    }

    // إذا لم توجد صورة، أنشئ avatar من الحروف الأولى للاسم
    return this.getDefaultAvatar(employee);
  }

  /**
   * عند حدوث خطأ في تحميل الصورة
   */
  onImageError(event: Event, employee: Employee): void {    
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.getDefaultAvatar(employee);
    
    // Optional: mark image as invalid
    employee.imageUrl = undefined;
  }

  /**
   * إنشاء avatar افتراضي من الحروف الأولى للاسم
   */
  private getDefaultAvatar(employee: Employee): string {
    const initials = employee.name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);

    return `https://ui-avatars.com/api/?name=${initials}&background=3b82f6&color=fff&size=100`;
  }
}