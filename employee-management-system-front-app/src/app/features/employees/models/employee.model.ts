export interface Employee {
  id?: number;
  code: string;
  name: string;
  dateOfBirth?: string;
  address?: string;
  mobile?: string;
  salary: number;
  departmentId: number;
  departmentName?: string;
  departmentCode?: string;
  imageUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}