export interface DepartmentSearchCriteria {
  code?: string;
  name?: string;
  isActive?: boolean | null;

  page: number;
  size: number;
  sortBy: string;
  sortDirection: 'ASC' | 'DESC';
}
