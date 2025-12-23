import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { DepartmentFormComponent } from '../department-form/department-form.component';
import { Department } from '../../models/department.model';
import { DepartmentSearchCriteria } from '../../models/department-search-criteria';
import { PaginationInfo } from '../../../../core/models/pagination-info.model';
import { STATUS_OPTIONS } from '../../../../utils/constants';
import { DepartmentService } from '../../../../core/services/department.service';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    CardModule,
    DepartmentFormComponent,
  ],
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.css'],
  providers: [ConfirmationService],
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  loading: boolean = false;
  showDialog: boolean = false;
  selectedDepartment: Department | null = null;
  isEditMode: boolean = false;

  // Search Criteria
  searchCriteria: DepartmentSearchCriteria = {
    page: 0,
    size: 10,
    sortBy: 'name',
    sortDirection: 'ASC',
  };

  // Pagination
  paginationInfo: PaginationInfo | null = null;
  totalRecords: number = 0;
  rows: number = 10;

  statusOptions = STATUS_OPTIONS;

  constructor(
    private departmentService: DepartmentService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.departmentService.searchDepartments(this.searchCriteria).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.departments = response.data.content || response.data;
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
          detail: 'Failed to load departments',
          life: 5000,
        });
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    this.searchCriteria.page = 0; // Reset to first page
    this.loadDepartments();
  }

  resetFilters(): void {
    this.searchCriteria = {
      page: 0,
      size: 10,
      sortBy: 'name',
      sortDirection: 'ASC',
    };
    this.loadDepartments();
  }

  onPageChange(event: any): void {
    this.searchCriteria.page = event.first / event.rows;
    this.searchCriteria.size = event.rows;
    this.loadDepartments();
  }

  openAddDialog(): void {
    this.selectedDepartment = null;
    this.isEditMode = false;
    this.showDialog = true;
  }

  openEditDialog(department: Department): void {
    this.selectedDepartment = { ...department };
    this.isEditMode = true;
    this.showDialog = true;
  }

  openViewDialog(department: Department): void {
    this.selectedDepartment = { ...department };
    this.isEditMode = false;
    this.showDialog = true;
  }

  deleteDepartment(department: Department): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete department "${department.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (department.id) {
          this.departmentService.deleteDepartment(department.id).subscribe({
            next: (response) => {
              if (response.success) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: response.message || 'Department deleted successfully',
                  life: 3000,
                });
                this.loadDepartments();
              }
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete department',
                life: 5000,
              });
            },
          });
        }
      },
    });
  }

  toggleDepartmentStatus(department: Department): void {
    const action = department.isActive ? 'deactivate' : 'activate';
    const actionText = department.isActive ? 'Deactivate' : 'Activate';

    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} department "${department.name}"?`,
      header: `Confirm ${actionText}`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (department.id) {
          const updatedDepartment = {
            ...department,
            isActive: !department.isActive,
          };
          this.departmentService
            .updateDepartment(department.id, updatedDepartment)
            .subscribe({
              next: (response) => {
                if (response.success && response.data) {
                  const index = this.departments.findIndex(
                    (d) => d.id === department.id
                  );
                  if (index !== -1) {
                    this.departments[index] = response.data;
                  }
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail:
                      response.message ||
                      `Department ${actionText}d successfully`,
                    life: 3000,
                  });
                }
              },
              error: (error) => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: `Failed to ${action} department`,
                  life: 5000,
                });
              },
            });
        }
      },
    });
  }

  get displayedItemsCount(): number {
    return Math.min(
      (this.paginationInfo!.page + 1) * this.paginationInfo!.size,
      this.paginationInfo!.totalElements
    );
  }

  onDialogClose(success: boolean): void {
    this.showDialog = false;
    this.selectedDepartment = null;
    if (success) {
      this.loadDepartments();
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

  getStatusSeverity(isActive: boolean | undefined): string {
    return isActive ? 'success' : 'danger';
  }

  getStatusText(isActive: boolean | undefined): string {
    return isActive ? 'Active' : 'Inactive';
  }
}
