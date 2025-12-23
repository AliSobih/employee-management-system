import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Department } from '../../features/departments/models/department.model';
import { ApiResponse } from '../models/api-response.model';
import { DepartmentSearchCriteria } from '../../features/departments/models/department-search-criteria';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private endpoint = '/api/v1/departments';

  constructor(private apiService: ApiService) {}

  createDepartment(department: Department): Observable<ApiResponse<Department>> {
    return this.apiService.post<ApiResponse<Department>>(this.endpoint, department);
  }

  updateDepartment(id: number, department: Department): Observable<ApiResponse<Department>> {
    return this.apiService.put<ApiResponse<Department>>(`${this.endpoint}/${id}`, department);
  }

  getAllDepartments(): Observable<ApiResponse<Department[]>> {
    return this.apiService.get<ApiResponse<Department[]>>(this.endpoint);
  }

  getAllActiveDepartments(): Observable<ApiResponse<Department[]>> {
    return this.apiService.get<ApiResponse<Department[]>>(`${this.endpoint}/active`);
  }

  searchDepartments(criteria: DepartmentSearchCriteria): Observable<ApiResponse<any>> {
    return this.apiService.post<ApiResponse<any>>(`${this.endpoint}/search`, criteria);
  }

  deleteDepartment(id: number): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }

  restoreDepartment(id: number): Observable<ApiResponse<void>> {
    return this.apiService.patch<ApiResponse<void>>(`${this.endpoint}/${id}/restore`);
  }

  checkCodeExists(code: string): Observable<ApiResponse<boolean>> {
    return this.apiService.get<ApiResponse<boolean>>(`${this.endpoint}/exists/code/${code}`);
  }

  checkNameExists(name: string): Observable<ApiResponse<boolean>> {
    return this.apiService.get<ApiResponse<boolean>>(`${this.endpoint}/exists/name/${name}`);
  }
}