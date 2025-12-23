export interface EmployeeSearchCriteria {
  code?: string;
  name?: string;
  departmentId?: number;
  minSalary?: number;
  maxSalary?: number;
  mobile?: string;
  isActive?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}